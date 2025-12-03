// auth-login.js (login)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ---------- FIREBASE CONFIG ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBSjokiALiFIQJgFebqQFezjeutxE02B44",
  authDomain: "login-a2393.firebaseapp.com",
  projectId: "login-a2393",
  storageBucket: "login-a2393.firebasestorage.app",
  messagingSenderId: "843226646050",
  appId: "1:843226646050:web:711055458392e3426cac7b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ---- LOGIN FORM ---- */
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // redirect to home
      window.location.href = "index.html";

    } catch (err) {
      loginError.textContent = getFriendlyError(err);
    }
  });
}

/* ---- ERROR MESSAGES ---- */
function getFriendlyError(err) {
  if (!err || !err.code) return err?.message || "An error occurred.";
  const code = err.code;

  if (code.includes("auth/user-not-found"))
    return "No account found with this email.";

  if (code.includes("auth/wrong-password"))
    return "Incorrect password.";

  if (code.includes("auth/invalid-email"))
    return "Invalid email address.";

  if (code.includes("auth/too-many-requests"))
    return "Too many attempts, try later.";

  return err.message || "Login failed.";
}
