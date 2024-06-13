import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    const userTable = document.getElementById("userTableBody");

    const querySnapshot = await getDocs(collection(db, "user"));

    querySnapshot.forEach(doc => {
        const userData = doc.data();
        console.log(userData);
        const row = userTable.insertRow();
        const uid = row.insertCell(0);
        const username = row.insertCell(1);
        const email = row.insertCell(2);
        const joinDate = row.insertCell(3);
        const cellActions = row.insertCell(4);

        uid.innerHTML = userData.uid;
        username.innerHTML = userData.username;
        email.innerHTML = userData.email;
        joinDate.innerHTML = new Date(userData.createdAt.toDate()).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const editButton = document.createElement('button');
        editButton.id = 'editButton';
        editButton.className = 'btn btn-warning';
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () => editGame(doc.id, gameData));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.id = 'deleteButton';
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', () => deleteConfirm(doc.id, userData.uid));

        // Append both buttons to the same cell
        cellActions.appendChild(editButton);
        cellActions.appendChild(deleteButton);
    });

   
});

async function deleteConfirm(userId, uid) {
    $.confirm({
        Animation:"scale",
        title: 'Confirm Delete',
        content: 'Are you sure you want to delete this user?',
        buttons: {
            confirm: {
                text: 'Yes, delete it',
                btnClass: 'btn-danger',
                action: async () => {
                    await deleteUser(userId, uid);
                }
            },
            cancel: {
                text: 'No, cancel',
                btnClass: 'btn-default'
            }
        }
    });
}

async function deleteUser(userId, uid) {
    console.log("path dari user adalah " + userId)
    console.log("path dari uid user adalah " + uid)
    try {
        const userDocRef = doc(db, "user", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            await deleteDoc(userDocRef);
            location.reload();
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error deleting user document: ", error);
    }
}

function editUser(userId, gameData){
    console.log("path dari user adalah " + userId)

}