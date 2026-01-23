import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// මේක ඔයාගේ වෙබ් ඇප් එකේ පාවිච්චි කරපු විස්තර ටිකමයි
const firebaseConfig = {
  apiKey: "AIzaSyBMsJnZVpmxSGYpfG6FxQBMuOubqxA-0TI",
  authDomain: "photo-final-35ca9.firebaseapp.com",
  projectId: "photo-final-35ca9",
  storageBucket: "photo-final-35ca9.firebasestorage.app",
  messagingSenderId: "3283669364",
  appId: "1:3283669364:web:67dec9368e2f422ef41c21"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);