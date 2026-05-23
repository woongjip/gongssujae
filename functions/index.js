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

    // 수신자의 안 읽은 채팅방 수 계산
    const chatsSnap = await admin.firestore()
      .collection("chats")
      .where("participants", "array-contains", recipientId)
      .get();

    const unreadCount = chatsSnap.docs.filter((d) => {
      const data = d.data();
      const lastRead = data.lastRead?.[recipientId];
      const updatedAt = data.updatedAt;
      if (!updatedAt) return false;
      if (!lastRead) return true;
      return updatedAt.seconds > lastRead.seconds;
    }).length;

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: msg.fromName || "공쓰재 새 메시지",
        body: msg.text,
      },
      data: { chatId, itemTitle: itemTitle || "", badge: String(unreadCount) },
      apns: {
        payload: { aps: { sound: "default", badge: unreadCount } },
      },
      android: {
        notification: { sound: "default", channelId: "chat" },
      },
    }).catch((err) => console.error("FCM 전송 실패:", err));
  }
);
