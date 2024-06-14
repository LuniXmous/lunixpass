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
        const cellDesc = row.insertCell(3);
        const cellPublisher = row.insertCell(4);
        const cellReleaseDate = row.insertCell(5);
        const cellSize = row.insertCell(6);
        const cellGenre = row.insertCell(7);
        const cellTier = row.insertCell(8);
        const cellActions = row.insertCell(9);
        uid.innerText = doc.id;
        cellTier.style.textAlign = 'center';
        cellTier.innerText = gameData.game_tier;
        cellName.innerText = gameData.game_name;
        cellDesc.innerText = gameData.game_desc;
        cellPublisher.innerText = gameData.game_detail.publisher;
        cellReleaseDate.innerText = gameData.game_detail.release_date;
        cellSize.innerText = gameData.game_detail.size + " GB";
        cellGenre.innerText = gameData.genre.join(", ");
        cellImage.innerHTML = `<img src="${gameData.game_image}" alt="${gameData.game_name}" width="100">`;

        const editButton = document.createElement('button');
        editButton.id = 'editButton';
        editButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded';
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

        const deleteButton = document.createElement('button');
        deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded';
        deleteButton.id = 'deleteButton';
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', () => deleteGame(doc.id));

        // Append both buttons to the same cell
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

    openModal();
}

const editModal = document.getElementById('editModal');

const saveChangesButton = document.getElementById('saveChanges');

function openModal() {
    editModal.classList.remove('hidden');
}

function closeModal() {
    editModal.classList.add('hidden');
}


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
        location.reload(); // Refresh the page to show updated data
    }

    closeModal();
});

