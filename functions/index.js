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

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: msg.fromName || "공쓰재 새 메시지",
        body: msg.text,
      },
      data: { chatId, itemTitle: itemTitle || "" },
      apns: {
        payload: { aps: { sound: "default", badge: 1 } },
      },
      android: {
        notification: { sound: "default", channelId: "chat" },
      },
    }).catch((err) => console.error("FCM 전송 실패:", err));
  }
);
