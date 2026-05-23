importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// 새 버전 배포 시 기존 SW를 즉시 교체한다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

firebase.initializeApp({
  apiKey: "AIzaSyBRvtpDpSO6JAT-UJHVApDmLCXhanIFuqM",
  authDomain: "gonssujae.firebaseapp.com",
  projectId: "gonssujae",
  storageBucket: "gonssujae.firebasestorage.app",
  messagingSenderId: "779975780698",
  appId: "1:779975780698:web:6d82afbd89c7fb5d0cab63"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // iOS PWA: APNS가 notification 페이로드를 받아 OS 레벨에서 이미 알림을 표시한다.
  // 여기서 showNotification을 추가로 호출하면 중복이 되므로 건너뛴다.
  // Android/Chrome: onBackgroundMessage 등록 시 FCM이 자동 표시를 억제하므로
  // 직접 showNotification을 호출해야 알림이 뜬다.
  const isIOS = /iPhone|iPad|iPod/.test(self.navigator.userAgent);

  if (!isIOS) {
    const title = payload.notification?.title || '공쓰재 새 메시지';
    const body  = payload.notification?.body  || '';
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: payload.data || {},
    });
  }

  // 앱이 닫혀 있을 때 뱃지 표시 (정확한 개수는 앱 열릴 때 재설정됨)
  if (self.registration.setBadge) {
    self.registration.setBadge();
  }
});
