var test = document.querySelector("#test");
test.addEventListener("click", InsertData);
// var testing = document.querySelector("#testing");
// testing.addEventListener("click", deleteUser);

// Polyfill for global in browser environment
window.global = window;

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, deleteDoc, doc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUMTzcvauGBX39A-LgSW1l__9bOQQoA2M",
    authDomain: "quiet-biplane-423907-k3.firebaseapp.com",
    projectId: "quiet-biplane-423907-k3",
    storageBucket: "quiet-biplane-423907-k3.appspot.com",
    messagingSenderId: "731486024167",
    appId: "1:731486024167:web:f85904688fa61c38008d42",
    measurementId: "G-Q437YMP37Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
// insert random data into Firebase
function InsertData(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const myCollection = collection(db, 'user');
    const myDocumentData = {
        username: username,
        email: generateRandomEmail(),
        password: password,
        list_owned_game: ["a", "a"],
        statistic: {
            achievement: "0",
            game_owned: "0",
            game_time: "0"
        },
        createdAt: serverTimestamp()
    }

    addDoc(myCollection, myDocumentData).then((newDocRef) => {
        console.log('New document added with ID:', newDocRef.id);
    }).catch((error) => {
        console.error('Error adding document: ', error);
    });
}
// Hapus data 
document.addEventListener('DOMContentLoaded', async () => {
    const userTable = document.getElementById('userTable').getElementsByTagName('tbody')[0];
    
    const querySnapshot = await getDocs(collection(db, "user"));
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const row = userTable.insertRow();
        
        const cellUsername = row.insertCell(0);
        const cellPassword = row.insertCell(1);
        const cellEdit = row.insertCell(2);
        const cellDelete = row.insertCell(3);
        
        cellUsername.innerText = userData.username;
        cellPassword.innerText = userData.email;

        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () => editUser(doc.id, userData.username, userData.password));
        cellEdit.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', () => deleteUser(doc.id));
        cellDelete.appendChild(deleteButton);
    });
});

async function deleteUser(userId) {
    await deleteDoc(doc(db, "user", userId));
    location.reload(); // Refresh the page to show updated data
}

function editUser(userId, username, password) {
    const newUsername = prompt("Enter new username:", username);
    const newPassword = prompt("Enter new password:", password);

    if (newUsername && newPassword) {
        updateDoc(doc(db, "user", userId), {
            username: newUsername,
            password: newPassword
        }).then(() => {
            location.reload(); // Refresh the page to show updated data
        });
    }
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Add logic to save the new user to Firestore
    // Example: await addDoc(collection(db, "user"), { username, password });
    // After adding, you can also reload the data or append the new user to the table directly
});

