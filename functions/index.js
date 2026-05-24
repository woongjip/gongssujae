const { onDocumentCreated, onDocumentUpdated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

// 새 채팅 메시지 → 수신자에게 FCM 푸시 알림
exports.onNewMessage = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const msg = event.data.data();
    const chatId = event.params.chatId;

    const chatDoc = await admin.firestore().doc(`chats/${chatId}`).get();
    if (!chatDoc.exists) return;

    const { participants, itemTitle } = chatDoc.data();
    const recipientId = participants?.find((uid) => uid !== msg.from);

    console.log("[onNewMessage]", JSON.stringify({
      chatId,
      from: msg.from,
      participants,
      recipientId: recipientId || null,
      senderEqualsRecipient: msg.from === recipientId,
    }));

    // 안전장치: recipient를 못 찾거나 발신자 본인이면 중단
    if (!recipientId) {
      console.log("[onNewMessage] recipientId 없음 — 종료");
      return;
    }
    if (recipientId === msg.from) {
      console.log("[onNewMessage] recipientId === msg.from — 발신자 본인. 종료");
      return;
    }

    const userDoc = await admin.firestore().doc(`users/${recipientId}`).get();
    const fcmToken = userDoc.data()?.fcmToken;

    console.log("[onNewMessage]", JSON.stringify({
      tokenTargetUid: recipientId,
      hasToken: !!fcmToken,
    }));

    if (!fcmToken) return;

    // 수신자의 안 읽은 메시지 총 개수 계산 (unreadCount.[recipientId] 합산)
    // sendMsg에서 increment를 addDoc 전에 먼저 커밋하므로 +1 보정 없이 그대로 합산한다.
    const chatsSnap = await admin.firestore()
      .collection("chats")
      .where("participants", "array-contains", recipientId)
      .get();

    const unreadMsgCount = chatsSnap.docs.reduce((sum, d) => {
      return sum + (d.data().unreadCount?.[recipientId] || 0);
    }, 0);

    console.log("[onNewMessage]", JSON.stringify({ unreadMsgCount }));

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: msg.fromName || "공쓰재 새 메시지",
        body: msg.text,
      },
      data: { chatId, itemTitle: itemTitle || "", badge: String(unreadMsgCount) },
      apns: {
        payload: { aps: { sound: "default", badge: unreadMsgCount } },
      },
      android: {
        notification: { sound: "default", channelId: "chat" },
      },
    }).catch(async (err) => {
      console.error("[onNewMessage] FCM 전송 실패:", err?.errorInfo?.code, err?.message);
      // 무효 토큰이면 users 문서에서 제거한다.
      const invalid = ["messaging/registration-token-not-registered", "messaging/invalid-argument"];
      if (invalid.includes(err?.errorInfo?.code)) {
        await admin.firestore().doc(`users/${recipientId}`).update({ fcmToken: admin.firestore.FieldValue.delete() });
        console.log("[onNewMessage] 무효 토큰 제거:", recipientId);
      }
    });
  }
);

// FCM 토큰 중복 정리: 같은 토큰이 다른 계정에 남아있으면 서버에서 제거
exports.onFcmTokenUpdated = onDocumentUpdated("users/{uid}", async (event) => {
  const before = event.data.before.data()?.fcmToken;
  const after  = event.data.after.data()?.fcmToken;
  // 토큰이 새로 생기거나 바뀐 경우만 처리
  if (!after || after === before) return;

  const uid = event.params.uid;
  const snap = await admin.firestore()
    .collection("users")
    .where("fcmToken", "==", after)
    .get();

  const stale = snap.docs.filter(d => d.id !== uid);
  if (stale.length === 0) return;

  await Promise.all(stale.map(d => d.ref.update({ fcmToken: admin.firestore.FieldValue.delete() })));
  console.log("[onFcmTokenUpdated] 중복 토큰 제거:", stale.map(d => d.id));
});

// 거래 후기 → 판매자 공연온도 업데이트
exports.onReviewCreated = onDocumentWritten("reviews/{reviewId}", async (event) => {
  // 새로 생성된 문서만 처리 (중복 평가 방지)
  // exists는 DocumentSnapshot의 boolean 프로퍼티 (메서드 아님)
  if (event.data.before.exists) {
    console.log("[onReviewCreated] 이미 존재하는 리뷰 — 중복 무시:", event.params.reviewId);
    return;
  }

  const review = event.data.after.data();
  const { revieweeId, delta } = review;

  if (!revieweeId || delta === undefined) {
    console.error("[onReviewCreated] 필수 필드 누락:", review);
    return;
  }

  const userRef = admin.firestore().doc(`users/${revieweeId}`);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    console.error("[onReviewCreated] reviewee 문서 없음:", revieweeId);
    return;
  }

  const currentTemp = userSnap.data()?.temp ?? 36.5;
  const newTemp = Math.max(30, Math.min(50, +((currentTemp + delta).toFixed(1))));

  await userRef.update({ temp: newTemp });
  console.log("[onReviewCreated]", JSON.stringify({
    reviewId: event.params.reviewId,
    revieweeId,
    currentTemp,
    delta,
    newTemp,
  }));
});
