import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc , Timestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from './key.js';


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
    const userTable = document.getElementById("userTableBody");

    const querySnapshot = await getDocs(collection(db, "user"));

    querySnapshot.forEach(doc => {
        const userData = doc.data();

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
        const viewButton = document.createElement('button');
        viewButton.id = 'viewButton';
        viewButton.className = 'btn btn-primary me-2';
        viewButton.innerText = 'View';
        viewButton.addEventListener('click', () => viewUser(doc.id,userData));

        const editButton = document.createElement('button');
        editButton.id = 'editButton';
        editButton.className = 'btn btn-warning me-2';
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () => editUser(doc.id, userData));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger me-2';
        deleteButton.id = 'deleteButton';
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', () => deleteConfirm(doc.id, userData.uid));

        // Append both buttons to the same cell
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
    document.getElementById("viewUserModalLabel").innerHTML = userData.username+ "'s Profile";
    document.getElementById("view_email").innerHTML = "Email : "+userData.email;
    document.getElementById("view_username").innerHTML = "Username : "+userData.username;
    document.getElementById("view_id").innerHTML = "UID : "+userData.uid;
    document.getElementById("view_statistic").innerHTML = "Game Achievement :  "+userData.statistic.achievement;
    document.getElementById("view_game_time").innerHTML = "Hours Played : "+userData.statistic.game_time;
    document.getElementById("view_subs_type").innerHTML = "Subscription Type : "+userData.subscription.subs_type;
    document.getElementById("view_subs_start_date").innerHTML = "Subscription Start Date : "+userData.subscription.subs_start_date;
    document.getElementById("view_subs_end_date").innerHTML = "Subscription End Date : "+userData.subscription.subs_end_date;
    document.getElementById("view_joined_at").innerHTML = "Joined At : "+formatDate(userData.createdAt.toDate());


$("#viewUserModal").modal("toggle")

}

async function deleteConfirm(userId, uid) {
    $.confirm({
        Animation:"scale",
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

function openModal(){
    $("#updateUserModal").modal("toggle")

}
function closeModal(){
    $('#updateUserModal').modal("hide");
}
function editUser(userId, userData) {
    // const date = new Date(userData.subscription.subs_start_date.second *1000 +userData.subscription.subs_start_date.nanosecond/1000000)
    document.getElementById("updateUsername").value = userData.username;
    document.getElementById("updateAchievement").value = userData.statistic.achievement;
    document.getElementById("updateGameTime").value = userData.statistic.game_time;
    document.getElementById("updateSubsDate").value = userData.subscription.subs_start_date
    document.getElementById("updateEndDate").value = userData.subscription.subs_end_date;
    document.getElementById("updateTier").value = userData.subscription.subs_type;
    document.getElementById("updateUserId").value = userId

    openModal();
}
const saveChangesButton = document.getElementById('saveChange');

saveChangesButton.addEventListener('click', async () => {
   const id = document.getElementById("updateUserId").value 
   const newUsername= document.getElementById("updateUsername").value 
  const newAchievement =  document.getElementById("updateAchievement").value 
  const newGameTime = document.getElementById("updateGameTime").value 
  const newSubsStartDate =  document.getElementById("updateSubsDate").value
   const newSubsEndDate =  document.getElementById("updateEndDate").value 
   const newTier = document.getElementById("updateTier").value 
if(newUsername && newAchievement && newGameTime && newSubsStartDate && newSubsEndDate && newTier) {
    await updateDoc(doc(db,"user", id ), {
        username : newUsername,
        statistic : {
            achievement : newAchievement,
            game_time : newGameTime
        },
        subscription :{
        subs_start_date : newSubsStartDate,
        subs_end_date : newSubsEndDate,
        subs_type : newTier,
        }
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