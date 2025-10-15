import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Firebase configuration from your frontend config
const firebaseConfig = {
  apiKey: "AIzaSyDfJTxWfi_HNRcp2ymyv4IeQXdkXDRaZpM",
  authDomain: "signinsignup-21bab.firebaseapp.com",
  projectId: "signinsignup-21bab",
  storageBucket: "signinsignup-21bab.firebasestorage.app",
  messagingSenderId: "142697259650",
  appId: "1:142697259650:web:56960063dca0504df18a9b",
  measurementId: "G-0MZ8BRDZ3Z"
};

// Initialize Firebase Admin SDK
// Using the service account key file you provided
const serviceAccount = JSON.parse(readFileSync('./signinsignup-21bab-firebase-adminsdk-fbsvc-533732efbc.json', 'utf8').replace(/^\u00e7\u00e7/, ''));

// Only initialize if we have valid credentials
if (serviceAccount.private_key) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId
    });
  }
} else {
  console.warn('⚠️  Firebase Admin SDK not initialized - missing service account credentials');
  console.log('💡 To fix this:');
  console.log('   1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('   2. Generate a new private key and download the JSON file');
  console.log('   3. Place the file in your project root');
  console.log('   4. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH in your .env file');
  console.log('   Or set individual environment variables: FIREBASE_PRIVATE_KEY, etc.');
}

export default admin;
