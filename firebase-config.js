import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDqrRabPRP9Jtn7HpzcvYwAY5mdJKRZ1Ic",
  authDomain: "sheeptube-bff33.firebaseapp.com",
  databaseURL: "https://sheeptube-bff33-default-rtdb.firebaseio.com",
  projectId: "sheeptube-bff33",
  storageBucket: "sheeptube-bff33.appspot.com",
  messagingSenderId: "43628511465",
  appId: "1:43628511465:web:2685387b6bd1c2ad303078",
  measurementId: "G-RCXNN2W9DT",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);