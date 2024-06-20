import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, Timestamp, getCountFromServer, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./key.js";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", async () => {
    // Retrieve the user ID from session storage
    const userId = sessionStorage.getItem('userID');

    if (userId) {
        try {
            // Fetch user role from Firestore
            const userDocRef = doc(db, "user", userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const userRole = userData.role;
                const userName = userData.username;

                // Display user information
                console.log(`User ID: ${userId}, Name: ${userName},  User Role: ${userRole}`);

                // Check if user is admin
                if (userRole === "admin") {
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
                    $.alert({
                        title: 'Welcome',
                        theme: 'supervan',
                        content: `Welcome, ${userName}!`,

                    });
                } else {
                    console.log("Non-admin user logged in.");
                    $.alert({
                        title: 'Error',
                        content: 'You are not an admin!',
                        onClose: function () {
                            window.location.href = 'login.html';
                        }
                    })
                }
            } else {
                console.log("No such document!");
                $.alert({
                    title: 'Error',
                    content: 'No such document!',
                    onClose: function () {
                        window.location.href = 'login.html';
                    }
                })

            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            $.alert({
                title: 'Error',
                content: error,
                onClose: function () {
                    window.location.href = 'login.html';
                }
            })

        }
    } else {
        $.alert({
            title: 'Error',
            content: 'No user ID found in session storage.',
            onClose: function () {
                window.location.href = 'login.html';
            }
        })

    }

});
const logoutBtn = document.getElementById("logOut");
logoutBtn.addEventListener("click", async () => {
    try {
        $.confirm({
            icon:"fa fa-warning",
            title: 'Logout',
            content: 'Are You Sure?',
            theme: 'supervan',
            buttons: {
                confirm: function () {
                    sessionStorage.removeItem('userID');
                    signOut(auth).then(() => {
                        window.location.href = 'login.html';
                    }).catch((error) => {
                        console.error("Error signing out:", error);
                    });
                },
                cancel: function () {
                   
                }
            }
        })

    } catch (error) {
        console.error("Error signing out:", error);
    }
});


