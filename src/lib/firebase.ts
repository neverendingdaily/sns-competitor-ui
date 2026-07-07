import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBLyWpVdxVYkPHzQWfN0f04QeG_Pe1wjs",
  authDomain: "sns-competitor-ui.firebaseapp.com",
  projectId: "sns-competitor-ui",
  storageBucket: "sns-competitor-ui.firebasestorage.app",
  messagingSenderId: "235287786378",
  appId: "1:235287786378:web:802bbd97f2b17412f74e73",
  measurementId: "G-PW8LD7X7J1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
