//firebase用の関数読み込み
//firestore用の関数読み込み
import { getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

//firebaseに接続そるための設定情報をまとめたもの
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

//firebaseアプリを初期化
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

//firestoreを使用するためのdbの作成
export const db = getFirestore(app);
export const auth = getAuth(app);