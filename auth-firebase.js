// auth-firebase.js (signup)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

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

/* ---- SIGNUP FORM ---- */
const signupForm = document.getElementById("signup-form");
const signupError = document.getElementById("signup-error");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    signupError.textContent = "";

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    if (!name) {
      signupError.textContent = "Please enter your full name.";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // save display name
      await updateProfile(userCredential.user, { displayName: name });

      // redirect to home
      window.location.href = "index.html";

    } catch (err) {
      signupError.textContent = getFriendlyError(err);
    }
  });
}

/* ---- ERROR MESSAGES ---- */
function getFriendlyError(err) {
  if (!err || !err.code) return err?.message || "An error occurred.";
  const code = err.code;

  if (code.includes("auth/email-already-in-use"))
    return "Email already registered. Try logging in.";

  if (code.includes("auth/invalid-email"))
    return "Invalid email address.";

  if (code.includes("auth/weak-password"))
    return "Password must be at least 6 characters.";

  return err.message || "Signup failed.";
}
