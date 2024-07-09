import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./key.js"


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    const userTable = document.getElementById("userTableBody");

    const querySnapshot = await getDocs(collection(db, "user"));

    querySnapshot.forEach(doc => {
        const userData = doc.data();

        const row = userTable.insertRow();
        row.setAttribute("class", "row-sm-12")
        const username = row.insertCell(0);
        const email = row.insertCell(1);
        const joinDate = row.insertCell(2);
        const cellActions = row.insertCell(3);

        username.innerHTML = userData.username;
        email.innerHTML = userData.email;
        joinDate.innerHTML = new Date(userData.createdAt.toDate()).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const viewButton = document.createElement('button');
        viewButton.id = 'viewButton';
        viewButton.className = 'btn btn-primary me-2 ';
        viewButton.innerHTML = '<i class="fa fa-eye"></i><span class="ms-1">View</span>';
        viewButton.addEventListener('click', () => viewUser(doc.id, userData));

        const editButton = document.createElement('button');
        editButton.id = 'editButton';
        editButton.className = 'btn btn-warning me-2';
        editButton.innerHTML = '<i class="fa fa-edit"></i><span class="ms-1">Edit</span>';
        editButton.addEventListener('click', () => editUser(doc.id, userData));

        const deleteButton = document.createElement('button');
        deleteButton.id = 'deleteButton';
        deleteButton.className = 'btn btn-danger';
        deleteButton.innerHTML = '<i class="fa fa-trash"></i><span class="ms-1">Delete</span>';
        deleteButton.addEventListener('click', () => deleteConfirm(doc.id, userData.uid));


        cellActions.setAttribute("class", "");
        cellActions.appendChild(viewButton);
        cellActions.appendChild(editButton);
        cellActions.appendChild(deleteButton);
    });


});

async function viewUser(id, userData) {
    console.log(userData.statistic.achievement);
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    };
    document.getElementById("viewUserModalLabel").innerHTML = userData.username + "'s Profile";
    if(userData.image){
        document.getElementById("view_image").src = userData.image;
    }else {
        document.getElementById("view_image").src = "https://firebasestorage.googleapis.com/v0/b/quiet-biplane-423907-k3.appspot.com/o/profile%2Fdefault.png?alt=media&token=68f08336-7d84-4a3c-8079-3851caf62768"
    }
    document.getElementById("view_email").innerHTML = "Email : " + userData.email;
    document.getElementById("view_username").innerHTML = "Username : " + userData.username;
    document.getElementById("view_id").innerHTML = "UID : " + userData.uid;
    document.getElementById("view_statistic").innerHTML = "Game Achievement :  " + userData.statistic.achievement;
    document.getElementById("view_game_time").innerHTML = "Hours Played : " + userData.statistic.game_time;
    if (userData.subscription) {
        document.getElementById("view_subs_status").innerHTML = `Subscription Status : ${userData.subscription.status ? "Non Active" : "Active"}`
        document.getElementById("view_subs_start_date").innerHTML = "Subscription Start Date : " + userData.subscription.subs_start_date.toDate().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });;
            document.getElementById("view_subs_end_date").innerHTML = "Subscription End Date : " + userData.subscription.subs_end_date.toDate().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });;
    } else {
        document.getElementById("view_subs_status").innerHTML = "Subscription Status : Not Active"
        document.getElementById("view_subs_start_date").innerHTML = "Subscription Start Date : Not Subcribing"
        document.getElementById("view_subs_end_date").innerHTML = "Subscription End Date : Not Subcribing"
    }
    document.getElementById("view_joined_at").innerHTML = "Joined At : " + formatDate(userData.createdAt.toDate());


    $("#viewUserModal").modal("toggle")

}

async function deleteConfirm(userId, uid) {
    $.confirm({
        Animation: "scale",
        theme: 'material',
        animationSpeed: 500,
        theme: 'dark',
        type: 'red',
        icon: 'fa fa-trash',
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
    try {
        const userDocRef = doc(db, "user", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            await deleteDoc(userDocRef);
            $.alert({
                type: 'green',
                icon: 'fa fa-check',
                theme: 'material',
                theme: "dark",
                title: 'Success',
                content: 'User deleted successfully!',
            })
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error deleting user document: ", error);
    }
}

function openModal() {
    $("#updateUserModal").modal("toggle")

}
function closeModal() {
    $('#updateUserModal').modal("hide");
}
function editUser(userId, userData) {
    // const date = new Date(userData.subscription.subs_start_date.second *1000 +userData.subscription.subs_start_date.nanosecond/1000000)
    document.getElementById("updateUsername").value = userData.username;
    document.getElementById("updateAchievement").value = userData.statistic.achievement;
    document.getElementById("updateGameTime").value = userData.statistic.game_time;
    document.getElementById("updateUserId").value = userId

    openModal();
}
const saveChangesButton = document.getElementById('saveChange');

saveChangesButton.addEventListener('click', async () => {
    const id = document.getElementById("updateUserId").value
    const newUsername = document.getElementById("updateUsername").value
    const newAchievement = document.getElementById("updateAchievement").value
    const newGameTime = document.getElementById("updateGameTime").value
    if (newUsername && newAchievement && newGameTime) {
        await updateDoc(doc(db, "user", id), {
            username: newUsername,
            statistic: {
                achievement: parseInt(newAchievement),
                game_time: parseInt(newGameTime)
            },
        });
        $.alert({
            title: 'Success',
            theme: 'material',
            animation: 'scale',
            type: 'green',
            icon: 'fa fa-check',
            theme: 'dark',
            content: 'User updated successfully',
            onClose: function () {
                location.reload();
            }
        })

    }
    closeModal();


})