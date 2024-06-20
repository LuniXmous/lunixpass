  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getFirestore, collection, addDoc, serverTimestamp, setDoc,doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
  import {firebaseConfig } from "./key.js"

  // Your web app's Firebase configuration

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const auth = getAuth(app);

  document.getElementById('registrationForm').addEventListener('submit', async function (event) {
      event.preventDefault();

      var usernameInput = document.getElementById('exampleInputUsername1');
      var emailInput = document.getElementById('exampleInputEmail1');
      var passwordInput = document.getElementById('exampleInputPassword1');
      var usernameError = document.getElementById('usernameError');
      var emailError = document.getElementById('emailError');
      var passwordError = document.getElementById('passwordError');
      var isValid = true;

      // Validasi username
      if (usernameInput.value.trim() === '') {
          usernameError.textContent = 'Username is required';
          isValid = false;
      } else {
          usernameError.textContent = '';
      }

      // Validasi email
      if (emailInput.value.trim() === '') {
          emailError.textContent = 'Email is required';
          isValid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
          emailError.textContent = 'Invalid email format';
          isValid = false;
      } else {
          emailError.textContent = '';
      }

      // Validasi password
      if (passwordInput.value.trim() === '') {
          passwordError.textContent = 'Password is required';
          isValid = false;
      } else {
          passwordError.textContent = '';
      }

      if (isValid) {
          try {
              const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value.trim());
              const user = userCredential.user;

              await setDoc(doc(db, "user", user.uid), {
                  uid: user.uid,
                  username: usernameInput.value.trim(),
                  email: emailInput.value.trim(),
                  subscription: {
                      subs_start_date: 0,
                      subs_type: 0,
                      subs_end_date: 0,
                      subs_status: false
                  },
                  statistic: {
                      achievement: "0",
                      game_owned: "0",
                      game_time: "0"
                  },
                  role:"user",
                  createdAt: serverTimestamp()
              });

              $.alert({
                title: 'Success',
                content: 'Registration successful!',
                theme:"dark",
                type: "green",
                icon :"fa fa-check-circle"
              })
          } catch (error) {
              if (error.code === 'auth/email-already-in-use') {
                  alert('The email address is already in use by another account.');
              } else {
                  console.error("Error adding document: ", error);
              }
          }
      }
  });
//   const testButton = document.getElementById('testingbutton');
//   testButton.addEventListener('click', function () {
    
//   });

  function isValidEmail(email) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }