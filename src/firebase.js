import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
  setDoc, getDoc, where, getDocs, increment
} from "firebase/firestore";
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "firebase/auth";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBRvtpDpSO6JAT-UJHVApDmLCXhanIFuqM",
  authDomain: "gonssujae.firebaseapp.com",
  projectId: "gonssujae",
  storageBucket: "gonssujae.firebasestorage.app",
  messagingSenderId: "779975780698",
  appId: "1:779975780698:web:6d82afbd89c7fb5d0cab63"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const VAPID_KEY = "BCgJza_FMPGfPIr977rEmVY1bQR06sb8p5gPmyc5tMe5_OUzR6fMWN7IpOdCYFmIUPUMIeEzQz2paKo3xGd-kYY";

export async function getMessagingInstance() {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch { return null; }
}

export async function registerFCMToken(uid) {
  const msg = await getMessagingInstance();
  if (!msg) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    if (token) await updateDoc(doc(db, "users", uid), { fcmToken: token });
  } catch (e) { console.log("FCM 등록 실패:", e); }
}

export {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp,
  setDoc, getDoc, where, getDocs, increment,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
};
