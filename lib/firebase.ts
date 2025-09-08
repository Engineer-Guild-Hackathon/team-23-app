// lib/firebase.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyA93Nc-zkYP0KnaakCWeiZKpP4jIx3kvqk',
  authDomain: 'tsunagite-86cca.firebaseapp.com',
  projectId: 'tsunagite-86cca',
  storageBucket: 'tsunagite-86cca.firebasestorage.app',
  messagingSenderId: '903357725505',
  appId: '1:903357725505:web:5f998efad536439c713fc0',
};

// デバッグ用：設定値を確認（機密情報は出力しない）
console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  allConfigPresent: Object.values(firebaseConfig).every(
    (v) => v !== undefined && v !== '',
  ),
});

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// RN では必ず initializeAuth を最初に呼ぶ（Web は getAuth）
let _auth: Auth;
if (Platform.OS === 'web') {
  _auth = getAuth(app);
} else {
  try {
    _auth = initializeAuth(app);
  } catch {
    // 既に初期化済み（Fast Refresh等）の場合
    _auth = getAuth(app);
  }
}

export const auth = _auth;
export const db = getFirestore(app);
