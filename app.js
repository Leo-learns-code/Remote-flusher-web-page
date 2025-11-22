// 1. FIXED IMPORTS (Using CDN URLs for the browser)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// 2. YOUR SPECIFIC CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBHYBoxP30fKSyTq0kd8v8Qr4DjrjMZ_T4",
  authDomain: "toilet-commander.firebaseapp.com",
  projectId: "toilet-commander",
  storageBucket: "toilet-commander.firebasestorage.app",
  messagingSenderId: "923432787828",
  appId: "1:923432787828:web:81bb39ce1e366144315621",
  measurementId: "G-ZTL86DR7HP"
};

// 3. INITIALIZE FIREBASE SERVICES
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 4. DOM ELEMENTS (Connecting to your HTML)
const loginSec = document.getElementById('login-section');
const controlSec = document.getElementById('control-section');
const paywallSec = document.getElementById('paywall-section');
const btnLogin = document.getElementById('btn-login');
const btnFlush = document.getElementById('btn-flush');
const btnLogout = document.getElementById('btn-logout');
const statusMsg = document.getElementById('status-msg');
const welcomeMsg = document.getElementById('welcome-msg');

// 5. EVENT LISTENERS

// --- LOGIN ---
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .catch((error) => alert("Login Failed: " + error.message));
    });
}

// --- LOGOUT ---
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        signOut(auth);
        if (paywallSec) paywallSec.classList.add('hidden');
    });
}

// --- FLUSH COMMAND ---
if (btnFlush) {
    btnFlush.addEventListener('click', () => {
        if (statusMsg) {
            statusMsg.innerText = "Sending signal...";
            statusMsg.style.color = "orange";
        }

        // Write "true" to the toilet trigger in the database
        set(ref(db, 'toilet/trigger'), true)
            .then(() => {
                // Success: You are on the whitelist
                if (statusMsg) {
                    statusMsg.innerText = "✅ Flush Signal Sent!";
                    statusMsg.style.color = "green";
                }
                if (paywallSec) paywallSec.classList.add('hidden');
                
                setTimeout(() => { 
                    if (statusMsg) {
                        statusMsg.innerText = "Ready..."; 
                        statusMsg.style.color = "#666"; 
                    }
                }, 3000);
            })
            .catch((error) => {
                // Failure: You are logged in, but not on the whitelist
                console.error("Write failed", error);
                if (statusMsg) {
                    statusMsg.innerText = "❌ Authorization Failed";
                    statusMsg.style.color = "red";
                }
                // Show the subscribe button
                if (paywallSec) paywallSec.classList.remove('hidden');
            });
    });
}

// 6. AUTH STATE MONITOR (Updates UI when you log in/out)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        if (loginSec) loginSec.classList.add('hidden');
        if (controlSec) controlSec.classList.remove('hidden');
        if (welcomeMsg) welcomeMsg.innerText = `Welcome, ${user.displayName}`;
    } else {
        // User is signed out
        if (loginSec) loginSec.classList.remove('hidden');
        if (controlSec) controlSec.classList.add('hidden');
        if (paywallSec) paywallSec.classList.add('hidden');
    }
});
