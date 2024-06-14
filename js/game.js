// Import Firebase modules and initialize Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./key.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', async () => {
    const gameTable = document.getElementById('gameTable').getElementsByTagName('tbody')[0];

    const querySnapshot = await getDocs(collection(db, "game"));
    querySnapshot.forEach((doc) => {
        const gameData = doc.data();
        const row = gameTable.insertRow();
        const uid = row.insertCell(0);
        const cellImage = row.insertCell(1);
        const cellName = row.insertCell(2);
        const cellTier = row.insertCell(3);
        const cellActions = row.insertCell(4);
        uid.innerText = doc.id;
        cellTier.style.textAlign = 'center';
        cellTier.innerText = gameData.game_tier;
        cellName.innerText = gameData.game_name;
        cellImage.innerHTML = `<img src="${gameData.game_image}" alt="${gameData.game_name}" width="100">`;

        const editButton = document.createElement('button');
        editButton.id = 'editButton';
        editButton.className = 'btn btn-warning me-2';
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () =>  {
          const editModal = document.getElementById('editModal');
          editModal.classList.remove('hidden');
          editGame(doc.id, gameData);
        });
        
        const modal = document.getElementById('editModal');
        const closeButtons = document.querySelectorAll('.btn-close');

        // Add a click event listener to each close button
        closeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        });
        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-primary me-2';
        viewButton.id = 'viewButton';
        viewButton.innerText = 'View';
        viewButton.addEventListener('click', () => viewGame(doc.id, gameData));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger me-2';
        deleteButton.id = 'deleteButton';
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', () => deleteConfirm(doc.id));

        // Append both buttons to the same cell
        cellActions.appendChild(viewButton);
        cellActions.appendChild(editButton);
        cellActions.appendChild(deleteButton);
    });
});

document.getElementById('gameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const gameName = document.getElementById('game_name').value;
    const gameDesc = document.getElementById('game_desc').value;
    const publisher = document.getElementById('publisher').value;
    const releaseDate = document.getElementById('release_date').value;
    const gameTier = parseInt(document.getElementById('game_tier').value);
    const size = parseInt(document.getElementById('size').value);
    const genre = document.getElementById('genre').value.split(',').map(g => g.trim());
    const gameImage = document.getElementById('game_image').files[0];

    const imageRef = ref(storage, `game_images/${gameName}`);
    await uploadBytes(imageRef, gameImage);
    const gameImageUrl = await getDownloadURL(imageRef);

    try {
        await addDoc(collection(db, "game"), {
            game_name: gameName,
            game_desc: gameDesc,
            game_detail: {
                publisher: publisher,
                release_date: releaseDate,
                size: size
            },
            game_tier: gameTier,
            genre: genre,
            game_image: gameImageUrl
        });
        alert('Data input successfully!');
        location.reload(); // Refresh the page to show updated data
    } catch (error) {
        console.error('Error adding document:', error);
        alert('Error adding data. Please try again.');
    }
});
async function deleteConfirm(gameId, uid) {
    $.confirm({
        type: 'red',
        theme: 'material',
        theme: "dark",
        Animation: "scale",
        icon: 'fa fa-warning',
        title: 'Confirm Delete',
        content: 'Are you sure you want to delete this game?',
        buttons: {
            confirm: {
                text: 'Yes, delete it',
                btnClass: 'btn-danger',
                action: async () => {
                    await deleteGame(gameId);
                }
            },
            cancel: {
                text: 'No, cancel',
                btnClass: 'btn-default'
            }
        }
    });
}
async function deleteGame(gameId) {
    try {
        console.log(gameId)
        // Step 1: Get the document to retrieve the image URL
        const gameDocRef = doc(db, "game", gameId);
        const gameDoc = await getDoc(gameDocRef);

        if (gameDoc.exists()) {
            const gameData = gameDoc.data();
            const gameImageUrl = gameData.game_image; // Ensure your document has this field

            // Step 2: Delete the image from Firebase Storage
            const imageRef = ref(storage, gameImageUrl);
            await deleteObject(imageRef);

            // Step 3: Delete the document from Firestore
            await deleteDoc(gameDocRef);

            // Step 4: Refresh the page to show updated data
            location.reload();
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error deleting game: ", error);
    }
}


function editGame(gameId, gameData) {
    document.getElementById('edit_game_id').value = gameId;
    document.getElementById('edit_game_name').value = gameData.game_name;
    document.getElementById('edit_game_desc').value = gameData.game_desc;
    document.getElementById('edit_publisher').value = gameData.game_detail.publisher;
    document.getElementById('edit_release_date').value = gameData.game_detail.release_date;
    document.getElementById('edit_size').value = gameData.game_detail.size;
    document.getElementById('edit_genre').value = gameData.genre.join(', ');
    document.getElementById('edit_game_image').value = gameData.game_image;

    $(editModal).modal("toggle")
}

const editModal = document.getElementById('editModal');

const saveChangesButton = document.getElementById('saveChanges');




saveChangesButton.addEventListener('click', async () => {
    const gameId = document.getElementById('edit_game_id').value;
    const newGameName = document.getElementById('edit_game_name').value;
    const newGameDesc = document.getElementById('edit_game_desc').value;
    const newPublisher = document.getElementById('edit_publisher').value;
    const newReleaseDate = document.getElementById('edit_release_date').value;
    const newSize = document.getElementById('edit_size').value;
    const newGenre = document.getElementById('edit_genre').value.split(',').map(g => g.trim());
    const newGameImage = document.getElementById('edit_game_image').value;

    if (newGameName && newGameDesc && newPublisher && newReleaseDate && newSize && newGenre && newGameImage) {
        await updateDoc(doc(db, "game", gameId), {
            game_name: newGameName,
            game_desc: newGameDesc,
            game_detail: {
                publisher: newPublisher,
                release_date: newReleaseDate,
                size: newSize
            },
            genre: newGenre,
            game_image: newGameImage
        });
        $("editModal").modal("hide");
        $.alert({
            theme: 'dark',
            title: 'Notifications',
            content: 'Data Updated',
            onClose: function () {
                location.reload();
            }
        });
    }

});


async function viewGame(gameId, gameData) {
    // document.getElementById('edit_game_id').value = gameId;
    document.getElementById('viewGameModalLabel').innerHTML = gameData.game_name;
    document.getElementById('view_image').src = gameData.game_image;
    document.getElementById('view_deskripsi').innerHTML = gameData.game_desc;
    document.getElementById('view_publisher').innerHTML = gameData.game_detail.publisher 
    document.getElementById('view_release_date').innerHTML = "Release Date : "+ gameData.game_detail.release_date;
    document.getElementById('view_size').innerHTML = "Size : "+ gameData.game_detail.size + " GB";
    document.getElementById('view_genre').innerHTML = gameData.genre.join(', ');
    document.getElementById('view_id').innerHTML = "Game ID : "+gameId


    $("#viewGameModal").modal("toggle");


}
