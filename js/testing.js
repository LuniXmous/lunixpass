import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, addDoc, deleteDoc, updateDoc, getDoc, Timestamp, getCountFromServer, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

                    const activeUsersQuery = query(countingUser, where("subscription.subs_status", "==", true));
                    const activeUserSnap = await getCountFromServer(activeUsersQuery);
                    document.getElementById("active_subs").innerHTML = activeUserSnap.data().count;

                    
                    const latestUserRegister = query(countingUser, orderBy("createdAt", "desc"), limit(100));
                    const latestUserSnap = await getDocs(latestUserRegister);
                    const dataPoints = [];
                    latestUserSnap.forEach((doc) => {
                        const createdAt = doc.data().createdAt.toDate();
                        const month = createdAt.getMonth(); // Get month (0-11)
                        const year = createdAt.getFullYear();

                        console.log(doc.id, "=>", doc.data());
                        const key = `${year}-${month}`; // Use year-month as the key

                        if (dataPoints[key]) {
                            dataPoints[key]++;
                        } else {
                            dataPoints[key] = 1;
                        }
                    })
                    renderChart(dataPoints);

                    function renderChart(dataPoints) {
                        const labels = [];
                        const data = [];

                        for (const key in dataPoints) {
                            if (dataPoints.hasOwnProperty(key)) {
                                const [year, month] = key.split('-');
                                labels.push(`${year}-${parseInt(month) + 1}`);
                                data.push(dataPoints[key]);
                            }
                        }

                        const ctx = document.getElementById('myAreaChart').getContext('2d');

                        new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'User',
                                    data: data,
                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: '#FFFFFF'  // Y-axis tick labels color
                                        },
                                        title: {
                                            display: true,
                                            text: 'Total Registrations',  // Y-axis title
                                            color: '#FFFFFF'  // Y-axis title color
                                        }
                                    },
                                    x: {
                                        ticks: {
                                            color: '#FFFFFF'  // X-axis tick labels color
                                        },
                                        title: {
                                            display: true,
                                            text: 'Months',  // X-axis title
                                            color: '#FFFFFF'  // X-axis title color
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        labels: {
                                            color: '#FFFFFF'  // Legend labels color
                                        }
                                    }
                                }
                            }
                        });
                    }


                    const News = collection(db, "berita");
                    const totalNewsSnap = await getCountFromServer(News);
                    document.getElementById("countNews").innerHTML = totalNewsSnap.data().count;
                    const latestNews = query(News, orderBy("date", "desc"), limit(100));
                    const latestNewsSnap = await getDocs(latestNews);
                    latestNewsSnap.forEach((doc) => {

                        const table = document.getElementById("latest_news")
                        const row = table.insertRow()
                        row.setAttribute("id", doc.id)
                        row.setAttribute("class", "bg-transparent")
                        const image = row.insertCell(0)
                        const cell1 = row.insertCell(1)
                        const cell2 = row.insertCell(2)
                        image.innerHTML = `<img src="${doc.data().image}" alt="${doc.data().header}" width="80">`
                        cell1.innerHTML = doc.data().header
                        cell2.innerHTML = doc.data().date.toDate().toLocaleDateString()


                    })

                    $.alert({
                        title: 'Welcome',
                        type: 'blue',
                        theme: 'dark',
                        content: `Welcome, ${userName}!`,

                    });

                } else {
                    console.log("Non-admin user ID.");
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

// async function logout() {
//     try {
//         $.confirm({
//             icon:"fa fa-warning",
//             title: 'Logout',
//             content: 'Are You Sure?',
//             theme: 'supervan',
//             buttons: {
//                 confirm: function () {
//                     sessionStorage.removeItem('userID');
//                     signOut(auth).then(() => {
//                         window.location.href = 'login.html';
//                     }).catch((error) => {
//                         console.error("Error signing out:", error);
//                     });
//                 },
//                 cancel: function () {

//                 }
//             }
//         })

//     } catch (error) {
//         console.error("Error signing out:", error);
//     }
//  }
const logoutBtn = document.getElementById("logout");


logoutBtn.addEventListener("click", async () => {
    try {
        $.confirm({
            icon: "fa fa-warning",
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


