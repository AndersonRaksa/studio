import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =================================================================================
// IMPORTANT: Replace this with your own Firebase project's configuration
//
// 1. Go to your Firebase project's console: https://console.firebase.google.com/
// 2. In the left menu, click "Project settings" (the gear icon).
// 3. Under the "General" tab, scroll down to "Your apps".
// 4. If you don't have a web app, create one.
// 5. Find your web app and click on the "SDK setup and configuration" section.
// 6. Select "Config" and copy the firebaseConfig object.
// 7. Paste it here, replacing the placeholder object below.
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123def456"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
