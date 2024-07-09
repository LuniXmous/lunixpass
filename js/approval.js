import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./key.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", async () => {
    const ApprovalTable = document.getElementById('ApprovalTable').getElementsByTagName('tbody')[0]; // Corrected to [0] to access the first tbody element
    const querySnapshot = await getDocs(collection(db, "transaksi"));
    
    for (const transaksiDoc of querySnapshot.docs) {
        const transaksiData = transaksiDoc.data();
        const row = ApprovalTable.insertRow();
        const transaksiId = row.insertCell(0);
        const transaksiUserId = row.insertCell(1);
        const transaksiCreatedAt = row.insertCell(2);
        const transaksiStatus = row.insertCell(3);
        console.log(transaksiDoc.id);
        const transId = transaksiDoc.id;
        const view = row.insertCell(4);
        const viewBtn = document.createElement("button");
        viewBtn.innerText = "View";
        viewBtn.className = "btn btn-primary";
        view.appendChild(viewBtn);
        viewBtn.innerHTML = '<i class="fa fa-eye"></i><span class="ms-1">View</span>';
        viewBtn.addEventListener("click", () => {
            viewProve(transId, transaksiData);
        });
        transaksiId.innerText = transaksiDoc.id;
        transaksiUserId.innerText = transaksiData.id_user;

        try {
            const userDoc = await getDoc(doc(db, "user", transaksiData.id_user));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                transaksiUserId.innerText = userData.username;
            } else {
                console.log(`No user found with id: ${transaksiData.id_user}`);
            }
        } catch (error) {
            console.error(`Error fetching user data for user id ${transaksiData.id_user}:`, error);
        }
       
        // Populate the rest of the cells with the corresponding data
        transaksiStatus.innerText = transaksiData.isApproved ? "Approved" : "Pending";
        transaksiCreatedAt.innerText = new Date(transaksiData.transaction_date.seconds * 1000).toLocaleString();
    }
});

const saveChangesButton = document.getElementById('saveChanges');

saveChangesButton.addEventListener("click", async () => {
    console.log("Saving changes...");
});

async function toUsername(transUserId) {
    const userDoc = await getDoc(doc(db, "user", transUserId));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.username;
    } else {
        console.log(`No user found with id: ${transUserId}`);
        return transUserId;
    }
}

async function updatedTransaksiStatus(transaksiId) {
    const transaksiRef = doc(db, "transaksi", transaksiId);
    await updateDoc(transaksiRef, {
        isApproved: true
    });
    location.reload(); 
}

async function viewProve(transaksiId, transaksiData) {
    $.confirm({
        title: 'Approve Subscription',
        content: `
            <div class="row">
                <div class="col-md-8">
                    <img id="view_image" src="${transaksiData.prove_payment}" alt="" style="width: 100%; height: auto;">
                </div>
                <div class="col-md-4" style="background-color: #373636; padding: 15px;">
                    <p id="transaksiId">Transaction ID: ${transaksiId}</p>
                    <p id="userId">User: ${await toUsername(transaksiData.id_user)}</p>
                    <p id="transaksiDate">Transaction Date: ${new Date(transaksiData.transaction_date.seconds * 1000).toLocaleString()}</p>
                    <p id="status">Status: ${transaksiData.isApproved ? "Approved" : "Pending"}</p>
                </div>
            </div>
        `,
        buttons: {
            approve: {
                text: 'Approve',
                btnClass: 'btn-primary',
                action: async function () {
                    await updatedTransaksiStatus(transaksiId);
                }
            },
            close: {
                text: 'Close',
                btnClass: 'btn-secondary'
            }
        }
    });
}
