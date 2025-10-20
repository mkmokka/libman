// ===== Firebase Imports =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, updatePassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// ===== Firebase Config =====
const firebaseConfig = {
 
   apiKey: "AIzaSyCNQibE_gJkj9QgxA-JPhqrwoai_n3_Olg",
  authDomain: "libman-1e572.firebaseapp.com",
  projectId: "libman-1e572",
  appId: "1:142390938427:web:a01c80d7e95900c545c51e",
  measurementId: "G-XLF5PPK9NP"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const analytics = getAnalytics(app);

// ======= Registration (Send Email Link) =======
async function registerWithEmail() {
  const email = document.getElementById("regEmail").value;
  const actionCodeSettings = {
    url: window.location.origin + '/finish.html',
    handleCodeInApp: true
  };
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    alert("Check your email to set your password!");
    logEvent(analytics, 'sign_up', { method: 'email_link' });
  } catch (err) {
    alert(err.message);
  }
}

// ======= Login with Email + Password =======
async function loginWithPassword() {
  const email = document.getElementById("logEmail").value;
  const password = document.getElementById("logPass").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    window.location.href = "game.html";
  } catch (err) {
    alert(err.message);
  }
}

// ======= Magic Link Handling =======
if (window.location.pathname.includes('finish.html')) {
  window.onload = async () => {
    const url = window.location.href;
    if (isSignInWithEmailLink(auth, url)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) email = prompt("Enter your email to confirm");
      try {
        const result = await signInWithEmailLink(auth, email, url);
        window.localStorage.removeItem('emailForSignIn');

        const passwordInput = document.getElementById("passwordInput");
        const submitBtn = document.getElementById("setPasswordBtn");
        const statusMsg = document.getElementById("statusMessage");

        submitBtn.onclick = async () => {
          const password = passwordInput.value;
          
          // ✅ Strong password condition:
          const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!strong.test(password)) {
            alert("Password must be at least 8 characters, include a capital letter, a number, and a symbol.");
            return;
          }

          await updatePassword(result.user, password);

          // ✅ Show complete message
          statusMsg.innerText = "Complete!";
          passwordInput.style.display = "none";
          submitBtn.style.display = "none";
        };
      } catch (err) { alert(err.message); }
    }
  };
}

