import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc , Timestamp, getCountFromServer, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./key.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    const countingUser = collection(db, "user");
    const userSnap = await getCountFromServer(countingUser);
    console.log("Jumlah Pengguna : " + userSnap.data().count);
    document.getElementById("user").innerHTML = userSnap.data().count;

    // Query to count games

    const countGame = collection(db, "game");
    const gameSnap = await getCountFromServer(countGame);
    console.log("Jumlah Game Saat ini  : " + gameSnap.data().count);
    document.getElementById("game").innerHTML = gameSnap.data().count;

    // Query to count users with active subscription
    const activeUsersQuery = query(countingUser, where("subscription.subs_status", "==", true));
    const activeUserSnap = await getCountFromServer(activeUsersQuery);
    document.getElementById("active_subs").innerHTML = activeUserSnap.data().count;
});
