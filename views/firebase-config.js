import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUE_HaEeBvB_nLh1zjvtQNVKaKrjUviOY",
  authDomain: "parkingmagnagementsystem.firebaseapp.com",
  projectId: "parkingmagnagementsystem",
  storageBucket: "parkingmagnagementsystem.appspot.com",
  messagingSenderId: "818245241408",
  appId: "1:818245241408:web:ba506b88bd25c1cbaeada5",
  measurementId: "G-NL27RPXGN5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);