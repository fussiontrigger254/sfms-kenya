// frontend/src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDaSvOBGmiFI1RUuo_0A-oG2ZMCoOPpRhk",
  authDomain: "sfms-kenya.firebaseapp.com",
  projectId: "sfms-kenya",
  storageBucket: "sfms-kenya.firebasestorage.app",
  messagingSenderId: "271365751955",
  appId: "1:271365751955:web:d61afb12fde69b8efff966",
  measurementId: "G-Y6KBGWZ21L"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app