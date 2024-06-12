// Import Firebase modules and initialize Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    // paste here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', async () => {
    const gameTable = document.getElementById('gameTable').getElementsByTagName('tbody')[0];

    const querySnapshot = await getDocs(collection(db, "game"));
    querySnapshot.forEach((doc) => {
        const gameData = doc.data();
        const row = gameTable.insertRow();

        const cellName = row.insertCell(0);
        const cellDesc = row.insertCell(1);
        const cellPublisher = row.insertCell(2);
        const cellReleaseDate = row.insertCell(3);
        const cellSize = row.insertCell(4);
        const cellGenre = row.insertCell(5);
        const cellImage = row.insertCell(6);
        const cellActions = row.insertCell(7);

        cellName.innerText = gameData.game_name;
        cellDesc.innerText = gameData.game_desc;
        cellPublisher.innerText = gameData.game_detail.publisher;
        cellReleaseDate.innerText = gameData.game_detail.release_date;
        cellSize.innerText = gameData.game_detail.size+ " GB";
        cellGenre.innerText = gameData.genre.join(", ");
        cellImage.innerHTML = `<img src="${gameData.game_image}" alt="${gameData.game_name}" width="50">`;

        const editButton = document.createElement('button');
        editButton.id = 'editButton';
        editButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () => editGame(doc.id, gameData));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded';
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
    const size = document.getElementById('size').value;
    const genre = document.getElementById('genre').value.split(',').map(g => g.trim());
    const gameImage = document.getElementById('game_image').files[0];

    const imageRef = ref(storage, `game_images/${gameName}`);
    await uploadBytes(imageRef, gameImage);
    const gameImageUrl = await getDownloadURL(imageRef);

    await addDoc(collection(db, "game"), {
        game_name: gameName,
        game_desc: gameDesc,
        game_detail: {
            publisher: publisher,
            release_date: releaseDate,
            size: size
        },
        genre: genre,
        game_image: gameImageUrl
    });

    location.reload(); // Refresh the page to show updated data
});

async function deleteGame(gameId) {
    await deleteDoc(doc(db, "game", gameId));
    location.reload(); // Refresh the page to show updated data
}

function editGame(gameId, gameData) {
    const newGameName = prompt("Enter new game name:", gameData.game_name);
    const newGameDesc = prompt("Enter new game description:", gameData.game_desc);
    const newPublisher = prompt("Enter new publisher:", gameData.game_detail.publisher);
    const newReleaseDate = prompt("Enter new release date:", gameData.game_detail.release_date);
    const newSize = prompt("Enter new size:", gameData.game_detail.size);
    const newGenre = prompt("Enter new genre (comma-separated):", gameData.genre.join(", "));
    const newGameImage = prompt("Enter new image URL:", gameData.game_image);

    if (newGameName && newGameDesc && newPublisher && newReleaseDate && newSize && newGenre && newGameImage) {
        updateDoc(doc(db, "game", gameId), {
            game_name: newGameName,
            game_desc: newGameDesc,
            game_detail: {
                publisher: newPublisher,
                release_date: newReleaseDate,
                size: newSize
            },
            genre: newGenre.split(',').map(g => g.trim()),
            game_image: newGameImage
        }).then(() => {
            location.reload(); // Refresh the page to show updated data
        });
    }
}