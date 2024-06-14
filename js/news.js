import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, Timestamp, getCountFromServer, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from './key.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', async () => {


    const newsTable = document.getElementById('newsTable');
    const querySnapshot = await getDocs(collection(db, 'berita'));
    querySnapshot.forEach((doc) => {
        const newsData = doc.data();
        console.log(newsData)
        const row = newsTable.insertRow();
        const uid = row.insertCell(0);
        const header = row.insertCell(1);
        const tindakan = row.insertCell(2);

        uid.innerHTML = doc.id;
        header.innerHTML = newsData.header;
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-warning me-2';
        editButton.innerHTML = 'Edit';

        editButton.addEventListener('click', () => editNews(doc.id, newsData))

        const deleteButton = document.createElement('button');
        deleteButton.className = "btn btn-danger me-2"
        deleteButton.innerHTML = 'Delete';
        deleteButton.addEventListener('click', () => deleteConfirm(doc.id))

        const viewButton = document.createElement('button');
        viewButton.className = "btn btn-primary me-2"
        viewButton.innerHTML = 'View';
        viewButton.addEventListener('click', () => viewNews(doc.id, newsData))


        tindakan.appendChild(viewButton)
        tindakan.appendChild(editButton);
        tindakan.appendChild(deleteButton);


    })
})
document.getElementById("addNewsForm").addEventListener('submit', async (e) => {
    e.preventDefault();
    const news_header = document.getElementById("news_header").value;
    const image_name = document.getElementById("news_img_name").value.replace(/ /g, "_").toLowerCase();
    const news_content = document.getElementById("news_content").value;
    const image = document.getElementById("image").files[0];
    const imageref = ref(storage, `news/${image_name}`);
    await uploadBytes(imageref, image);
    const image_header = await getDownloadURL(imageref);

    console.log(news_header + " " + news_content + " " + image_header);
    try {
        await addDoc(collection(db, "berita"), {
            header: news_header,
            content: news_content,
            image: image_header,
            date: serverTimestamp()
        });
        $("#addSubscriptionModal").modal("hide")
        $.alert({
            theme: 'dark',
            title: 'Notifications',
            content: 'Data Inserted Successfully',
            onClose: function () {
                location.reload();
            }
        });

    } catch (error) {
        console.error('Error adding document:', error);
        alert('Error adding data. Please try again.');
    }
});


async function deleteNews(uid) {
    console.log('deleteNews :' + uid)
    try {

        const newsDocRef = doc(db, "berita", uid);
        const newsDoc = await getDoc(newsDocRef);
        if (newsDoc.exists()) {
            const newsData = newsDoc.data();
            const newsImageUrl = newsData.image;
            const imageRef = ref(storage, newsImageUrl);
            await deleteObject(imageRef);
            await deleteDoc(newsDocRef);
            $.alert({
                theme: 'dark',
                title: 'Notifications',
                content: 'Data Deleted',
                onClose: function () {
                    location.reload();
                }
            });

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error deleting game: ", error);
    }


}
async function deleteConfirm(userId, uid) {
    $.confirm({
        theme: 'supervan',
        Animation: "scale",
        title: 'Confirm Delete',
        content: 'Are you sure you want to delete this News?',
        buttons: {
            confirm: {
                text: 'Yes, delete it',
                btnClass: 'btn-danger',
                action: async () => {
                    await deleteNews(userId, uid);
                }
            },
            cancel: {
                text: 'No, cancel',
                btnClass: 'btn-default'
            }
        }
    });
}
async function editNews(uid, newsData) {
    console.log('editNews : ' + uid)
    document.getElementById("docs_id").value = uid
    document.getElementById("edit_news_header").value = newsData.header
    document.getElementById("edit_news_content").value = newsData.content
    document.getElementById("edit_newsContentImage").src = newsData.image
    $("#updateSubscriptionModal").modal("toggle");
    
}

async function viewNews(uid, newsData) {
    console.log('viewNews : ' + uid)
    console.log('viewNews : ' + newsData.header)
    console.log('viewNews : ' + newsData.date.toDate())
    console.log('viewNews : ' + newsData.image)
    document.getElementById("newsContentHeader").innerText = newsData.header
    document.getElementById("newsContentDate").innerText = newsData.date.toDate()
    document.getElementById("newsContentImage").src = newsData.image
    document.getElementById("newsContentContent").innerText = newsData.content

    $("#viewSubscriptionModal").modal("toggle")

}
const saveChangesButton = document.getElementById('saveButtonEdit');
saveChangesButton.addEventListener("click", async () => {
    const updatedNewsHeader = document.getElementById("edit_news_header").value;
    const updatedNewsContent = document.getElementById("edit_news_content").value;
    const docId = document.getElementById("docs_id").value;
    console.log(docId + " ," + updatedNewsContent +" ," +updatedNewsHeader )
    if (updatedNewsHeader && updatedNewsContent) {
       await updateDoc(doc(db, "berita", docId), {
            header: updatedNewsHeader,
            content: updatedNewsContent
        }).then(() => {
            $("#updateSubscriptionModal").modal("hide");
            $.alert({
                theme: 'dark',
                title: 'Notifications',
                content: 'Data Updated',
                onClose: function () {
                    location.reload();
                }
            });
        }).catch((error) => {
            console.error("Error updating document: ", error);
        });
    }
})
