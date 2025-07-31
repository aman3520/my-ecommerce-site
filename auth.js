// scripts/auth.js
const auth = firebase.auth();

/* ---------- SIGN-UP ---------- */
document.getElementById("signup-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const pwd = document.getElementById("signup-password").value.trim();
  const msg = document.getElementById("signup-message");
  msg.textContent = "";

  auth.createUserWithEmailAndPassword(email, pwd)
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Signup successful! Please log in.";
      e.target.reset();
    })
    .catch(err => {
      msg.style.color = "red";
      msg.textContent = err.message.replace("Firebase: ", "");
    });
});

/* ----------- LOGIN ----------- */
document.getElementById("login-form")?.addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pwd = document.getElementById("login-password").value.trim();
  const msg = document.getElementById("login-message");
  msg.textContent = "";

  auth.signInWithEmailAndPassword(email, pwd)
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Login successful! Redirecting…";
      setTimeout(() => (location.href = "index.html"), 1200);
    })
    .catch(err => {
      msg.style.color = "red";
      msg.textContent = err.message.replace("Firebase: ", "");
    });
});

/* ---------- LOGOUT ---------- */
function attachLogoutHandler() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    auth.signOut().then(() => (location.href = "auth.html"));
  });
}
document.addEventListener("DOMContentLoaded", attachLogoutHandler);

/* --- SESSION & ROUTE GUARD --- */
auth.onAuthStateChanged(user => {
  // show / hide logout
  const btn = document.getElementById("logout-btn");
  if (btn) btn.style.display = user ? "inline-block" : "none";

  // protect pages
  const protectedPages = ["cart.html", "checkout.html"];
  const page = location.pathname.split("/").pop();
  if (!user && protectedPages.includes(page)) location.href = "auth.html";
});
