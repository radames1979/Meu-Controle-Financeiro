import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, getDocs, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, writeBatch, query, where, orderBy } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCv_BOIvgNvF35xGkBl1URnGhzn1LILbFI",
    authDomain: "meu-controle-financeiro-dab61.firebaseapp.com",
    projectId: "meu-controle-financeiro-dab61",
    storageBucket: "meu-controle-financeiro-dab61.appspot.com",
    messagingSenderId: "359873689601",
    appId: "1:359873689601:web:a67817678fdbb18ce76800"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    getDoc,
    getDocs,
    setDoc,
    onSnapshot,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    query,
    where,
    orderBy
};
