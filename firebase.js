// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0JxEo9yU-apDKB8T70U_SQVQNX8effDo",
  authDomain: "pantry-tracker-app-75f66.firebaseapp.com",
  projectId: "pantry-tracker-app-75f66",
  storageBucket: "pantry-tracker-app-75f66.appspot.com",
  messagingSenderId: "297791155338",
  appId: "1:297791155338:web:cac687586d02eba168d173",
  measurementId: "G-XW91DDCT6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export {auth, firestore}