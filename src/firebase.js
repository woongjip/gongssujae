import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
  setDoc, getDoc, where, getDocs, increment, deleteField,
  arrayUnion, arrayRemove
} from "firebase/firestore";
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  sendPasswordResetEmail, sendEmailVerification
} from "firebase/auth";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics, logEvent as _logEvent, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBRvtpDpSO6JAT-UJHVApDmLCXhanIFuqM",
  authDomain: "gonssujae.firebaseapp.com",
  projectId: "gonssujae",
  storageBucket: "gonssujae.firebasestorage.app",
  messagingSenderId: "779975780698",
  appId: "1:779975780698:web:6d82afbd89c7fb5d0cab63",
  measurementId: "G-YJL3VCPTJW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

let _analytics = null;
isAnalyticsSupported().then(ok => {
  if (!ok) return;
  _analytics = getAnalytics(app);
  console.log('[공쓰재] Firebase Analytics 초기화 완료');
}).catch(e => console.warn('[공쓰재] Analytics 초기화 실패:', e));

export function logEvent(name, params) {
  if (_analytics) try { _logEvent(_analytics, name, params); } catch (_) {}
}
export { storageRef, uploadBytes, getDownloadURL };

export const VAPID_KEY = "BCgJza_FMPGfPIr977rEmVY1bQR06sb8p5gPmyc5tMe5_OUzR6fMWN7IpOdCYFmIUPUMIeEzQz2paKo3xGd-kYY";

export async function getMessagingInstance() {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch { return null; }
}

// 이미 권한이 있을 때만 조용히 토큰 갱신 (onAuthStateChanged에서 자동 호출)
export async function registerFCMToken(uid) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const msg = await getMessagingInstance();
  if (!msg) return;
  try {
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    if (!token) return;
    await updateDoc(doc(db, "users", uid), { fcmToken: token });
  } catch (e) { console.log("FCM 등록 실패:", e); }
}

// 사용자 액션(버튼 클릭)에서만 호출 — 권한 요청 포함
export async function requestAndRegisterFCM(uid) {
  if (typeof Notification === "undefined") return false;
  const msg = await getMessagingInstance();
  if (!msg) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    if (!token) return false;
    await updateDoc(doc(db, "users", uid), { fcmToken: token });
    return true;
  } catch (e) { console.log("FCM 등록 실패:", e); return false; }
}

export async function unregisterFCMToken(uid) {
  const msg = await getMessagingInstance();
  if (!msg) return;
  try {
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    if (!token) return;
    await updateDoc(doc(db, "users", uid), { fcmToken: deleteField() });
  } catch (e) { console.log("FCM 토큰 제거 실패:", e); }
}

export {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp,
  setDoc, getDoc, where, getDocs, increment, deleteField,
  arrayUnion, arrayRemove,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut, sendPasswordResetEmail, sendEmailVerification,
};
