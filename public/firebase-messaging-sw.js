importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBRvtpDpSO6JAT-UJHVApDmLCXhanIFuqM",
  authDomain: "gonssujae.firebaseapp.com",
  projectId: "gonssujae",
  storageBucket: "gonssujae.firebasestorage.app",
  messagingSenderId: "779975780698",
  appId: "1:779975780698:web:6d82afbd89c7fb5d0cab63"
});

const messaging = firebase.messaging();

// onBackgroundMessage를 등록하면 FCM이 자동 알림 표시를 중단하고 이 핸들러에 위임한다.
// 알림 표시 + 앱 아이콘 뱃지 갱신을 함께 처리한다.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || '공쓰재 새 메시지';
  const body  = payload.notification?.body  || '';

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
  });

  // 앱이 닫혀 있을 때 뱃지 표시 (정확한 개수는 앱 열릴 때 재설정됨)
  if (self.registration.setBadge) {
    self.registration.setBadge();
  }
});
