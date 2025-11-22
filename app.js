// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// 1. PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
    apiKey: "AIzaSy...",           // Replace with yours
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// HTML Elements
const loginSec = document.getElementById('login-section');
const controlSec = document.getElementById('control-section');
const paywallSec = document.getElementById('paywall-section');
const btnLogin = document.getElementById('btn-login');
const btnFlush = document.getElementById('btn-flush');
const btnLogout = document.getElementById('btn-logout');
const statusMsg = document.getElementById('status-msg');
const welcomeMsg = document.getElementById('welcome-msg');

// --- EVENT LISTENERS ---

// 1. LOGIN
btnLogin.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .catch((error) => alert("Login Failed: " + error.message));
});

// 2. LOGOUT
btnLogout.addEventListener('click', () => {
    signOut(auth);
    paywallSec.classList.add('hidden'); // Hide paywall on logout
});

// 3. FLUSH (The Logic Core)
btnFlush.addEventListener('click', () => {
    statusMsg.innerText = "Sending signal...";
    statusMsg.style.color = "orange";

    // Attempt to write TRUE to the trigger
    set(ref(db, 'toilet/trigger'), true)
        .then(() => {
            // SUCCESS: User is on the whitelist
            statusMsg.innerText = "✅ Flush Signal Sent!";
            statusMsg.style.color = "green";
            paywallSec.classList.add('hidden'); // Hide paywall if they are now valid
            
            // Reset status text after 3 seconds
            setTimeout(() => { 
                statusMsg.innerText = "Ready..."; 
                statusMsg.style.color = "#666"; 
            }, 3000);
        })
        .catch((error) => {
            // FAILURE: User is logged in but permission denied (Not on whitelist)
            console.error("Write failed", error);
            statusMsg.innerText = "❌ Authorization Failed";
            statusMsg.style.color = "red";
            
            // Show the subscription button
            paywallSec.classList.remove('hidden');
        });
});

// --- AUTH STATE MONITOR ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loginSec.classList.add('hidden');
        controlSec.classList.remove('hidden');
        welcomeMsg.innerText = `Welcome, ${user.displayName}`;
    } else {
        // User is signed out
        loginSec.classList.remove('hidden');
        controlSec.classList.add('hidden');
        paywallSec.classList.add('hidden');
    }
});
