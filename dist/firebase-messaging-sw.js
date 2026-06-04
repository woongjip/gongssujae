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

  // iOS PWA는 apns.aps.badge가 아닌 Web Badge API로만 뱃지가 설정된다.
  // Cloud Functions가 data.badge에 넣어준 정확한 개수로 뱃지를 찍는다.
  // SW 전역에서는 navigator 대신 self.navigator 를 사용해야 iOS WebKit에서 안전하다.
  const badge = parseInt(payload.data?.badge || '0', 10);
  if (self.navigator?.setAppBadge) {
    const p = badge > 0
      ? self.navigator.setAppBadge(badge)
      : self.navigator.clearAppBadge();
    p?.catch(() => {});
  }
});
