const { onDocumentCreated } = require("firebase-functions/v2/firestore");
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
    if (!recipientId) return;

    const userDoc = await admin.firestore().doc(`users/${recipientId}`).get();
    const fcmToken = userDoc.data()?.fcmToken;
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
    }).catch((err) => console.error("FCM 전송 실패:", err));
  }
);
