// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { firebaseConfig } from "./key.js";

// Your web app's Firebase configuration

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Form submission attempted.");
    var email = document.getElementById("exampleInputEmail1").value;
    var password = document.getElementById("exampleInputPassword1").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid; // Retrieve the user's UID


        // Fetch user role from Firestore
        const userDocRef = doc(db, "user", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userRole = userData.role;
            const username = userData.username;
            const id = userDocSnap.id;
            console.log(`User ID: ${id}: Username: ${username} ,User Role: ${userRole}`);

            // Store user data in sessionStorag
            if (userRole === "admin") {
                console.log(`${userData.username} is a ${userRole}`);
                $.alert({
                    title: 'Success',
                    content: 'Login successful!',
                    theme: "dark",
                    type: "green",
                    icon: "fa fa-check-circle",
                    onClose: function () {
                        sessionStorage.setItem('userID', id);
                        window.location.href = 'dashboard.html';
                    }
                });
               
                // Optionally redirect to dashboard
                // window.location.href = 'dashboard.html';
            } else {
                console.log(`${userData.username} is a ${userRole}`);
               $.alert({
                title : "Failed",
                content: 'Not Admin Account ',
                    theme: "dark",
                    type: "red",
                    icon: "fa fa-exclamation-triangle",
                
               })
            }
        } else {
            console.log("No such document!");
        }

        

    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            $.alert({
                title : "Login Failed",
                content : "Incorrect Password",
                theme : "dark",
                type : "red",
                icon : "fa fa-exclamation-triangle"
            })
        } else if (error.code === 'auth/user-not-found') {
            $.alert({
                title: 'Login Failed',
                content: 'User not found.',
                theme: 'dark',
                type: 'red',
                icon: 'fa fa-exclamation-triangle'
            })
        } 
        else if (error.code === 'auth/invalid-credential') {
            $.alert({
                title: 'Login Failed',
                theme: 'dark',
                type: 'red',
                icon: 'fa fa-exclamation-triangle',
                content: 'Invalid credentials Incorrect Password or Email',
            })
        }
         else {
            $.alert({
                content: error.code,
                icon: 'fa fa-exclamation-triangle',
                type: 'red',
                theme : 'dark',
                title: 'Login Failed'})
        }
    }
});
 async function logout(){
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
 }
// Logout function
// document.getElementById("logoutButton").addEventListener("click", async function () {
//     try {
//         await signOut(auth);
//         sessionStorage.removeItem('userData'); // Remove user data from sessionStorage
//         console.log('User logged out successfully');
//         // Optionally redirect to login page
//         // window.location.href = 'login.html';
//     } catch (error) {
//         console.error("Error logging out: ", error);
//     }
// });
