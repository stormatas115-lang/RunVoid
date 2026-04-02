// =============================================
//  Firebase Config + Init
// =============================================
const firebaseConfig = {
  apiKey: "AIzaSyCD0gVXr7dDnKuIpqXjVet2vvI09ryPGvU",
  authDomain: "voidruninc.firebaseapp.com",
  projectId: "voidruninc",
  storageBucket: "voidruninc.firebasestorage.app",
  messagingSenderId: "832807736710",
  appId: "1:832807736710:web:fdfba2332c3aa274fc8807",
  measurementId: "G-GJJV2MZQ0Q"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// =============================================
//  FRIEND CODE GENERATOR
// =============================================
async function generateUniqueFriendCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code, exists = true;
  while (exists) {
    code = 'VOID-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const check = await db.collection("users").where("friendCode", "==", code).get();
    exists = !check.empty;
  }
  return code;
}

// =============================================
//  TOAST NOTIFICATION
// =============================================
function showToast(message, type = "error") {
  const old = document.getElementById("vr-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "vr-toast";
  toast.innerText = message;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(-80px);
    background: ${type === "error" ? "rgba(220,30,30,0.95)" : "rgba(0,180,60,0.95)"};
    color: #fff;
    padding: 14px 28px;
    border-radius: 10px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 30px ${type === "error" ? "rgba(220,30,30,0.5)" : "rgba(0,180,60,0.5)"};
    border: 1px solid ${type === "error" ? "rgba(255,80,80,0.4)" : "rgba(0,255,80,0.4)"};
    z-index: 9999;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
    opacity: 0;
    white-space: nowrap;
    max-width: 90vw;
    text-align: center;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(-50%) translateY(0px)";
      toast.style.opacity = "1";
    });
  });

  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(-80px)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// =============================================
//  UTILITIES
// =============================================
function showStep(stepId) {
  document.querySelectorAll(".step").forEach(el => el.style.display = "none");
  const target = document.getElementById(stepId);
  if (target) target.style.display = "flex";
}

function setLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerText = loading ? "Please wait..." : defaultText;
}

function friendlyError(code) {
  const map = {
    "auth/user-not-found":          "No account found with that email.",
    "auth/wrong-password":          "Incorrect password. Try again.",
    "auth/invalid-credential":      "No account found, or wrong password.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/email-already-in-use":    "That email is already registered.",
    "auth/weak-password":           "Password must be at least 6 characters.",
    "auth/too-many-requests":       "Too many attempts. Please wait and try again.",
    "auth/popup-closed-by-user":    "Google sign-in was cancelled.",
    "auth/popup-blocked":           "Popup was blocked. Please allow popups for this site.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
    "auth/network-request-failed":  "Network error. Check your connection.",
    "auth/unauthorized-domain":     "This domain is not authorized in Firebase. Add it to Authorized Domains.",
  };
  return map[code] || ("Error: " + (code || "Something went wrong."));
}

function shakeForm() {
  const card = document.querySelector(".card");
  if (!card) return;
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "shake 0.5s ease";
}

// =============================================
//  REGISTER
// =============================================
async function registerUser() {
  const email    = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPass").value;
  const username = document.getElementById("regUser").value.trim();

  if (!email || !password || !username) {
    showToast("Please fill in all fields.", "error");
    return;
  }
  if (password.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    return;
  }

  setLoading("regBtn", true, "Create Account");

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: username });

    // Generate a unique friend code for this user
    const friendCode = await generateUniqueFriendCode();

    // Save to Firestore
    await db.collection("users").doc(cred.user.uid).set({
      username:      username,
      usernameLower: username.toLowerCase(),
      email:         email,
      friendCode:    friendCode,
      createdAt:     firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await cred.user.sendEmailVerification();

    setLoading("regBtn", false, "Create Account");
    showToast("✅ Account created! Your friend code: " + friendCode, "success");
    setTimeout(() => { window.location.href = "login.html"; }, 3000);
  } catch (err) {
    setLoading("regBtn", false, "Create Account");
    showToast(friendlyError(err.code), "error");
    console.error("Register error:", err.code, err.message);
  }
}

// =============================================
//  LOGIN
// =============================================
function loginUser() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;

  if (!email || !password) {
    showToast("Please fill in all fields.", "error");
    return;
  }

  setLoading("loginBtn", true, "Login");

  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      const user = cred.user;
      setLoading("loginBtn", false, "Login");

      if (!user.emailVerified) {
        auth.signOut();
        shakeForm();
        showToast("⚠️ Please verify your email first. Check your inbox!", "error");
        setTimeout(() => {
          showToast("Tip: Check spam folder or register again to resend.", "error");
        }, 4500);
        return;
      }

      showToast("✅ Welcome back, " + (user.displayName || user.email) + "!", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 1500);
    })
    .catch(err => {
      setLoading("loginBtn", false, "Login");
      const noAccountCodes = ["auth/user-not-found", "auth/invalid-credential", "auth/wrong-password"];
      if (noAccountCodes.includes(err.code)) shakeForm();
      showToast(friendlyError(err.code), "error");
      console.error("Login error:", err.code, err.message);
    });
}

// =============================================
//  GOOGLE LOGIN
// =============================================
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    auth.signInWithRedirect(provider);
  } else {
    auth.signInWithPopup(provider)
      .then(async result => {
        const user = result.user;
        // Check if user already has a friend code
        const snap = await db.collection("users").doc(user.uid).get();
        const existing = snap.data() || {};
        let friendCode = existing.friendCode;
        if (!friendCode) {
          friendCode = await generateUniqueFriendCode();
        }
        await db.collection("users").doc(user.uid).set({
          username:      user.displayName || user.email,
          usernameLower: (user.displayName || user.email).toLowerCase(),
          email:         user.email,
          friendCode:    friendCode,
          createdAt:     firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        showToast("✅ Welcome, " + user.displayName + "!", "success");
        setTimeout(() => { window.location.href = "index.html"; }, 1200);
      })
      .catch(err => {
        console.error("Google login error:", err.code, err.message);
        showToast(friendlyError(err.code), "error");
      });
  }
}

// Handle redirect result (for mobile Google sign-in)
auth.getRedirectResult()
  .then(async result => {
    if (result && result.user) {
      const user = result.user;
      const snap = await db.collection("users").doc(user.uid).get();
      const existing = snap.data() || {};
      let friendCode = existing.friendCode;
      if (!friendCode) {
        friendCode = await generateUniqueFriendCode();
      }
      await db.collection("users").doc(user.uid).set({
        username:      user.displayName || user.email,
        usernameLower: (user.displayName || user.email).toLowerCase(),
        email:         user.email,
        friendCode:    friendCode,
        createdAt:     firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      showToast("✅ Welcome, " + user.displayName + "!", "success");
      setTimeout(() => { window.location.href = "index.html"; }, 1200);
    }
  })
  .catch(err => {
    if (err.code && err.code !== "auth/no-current-user") {
      console.error("Redirect result error:", err.code, err.message);
      showToast(friendlyError(err.code), "error");
    }
  });

// =============================================
//  DOM READY
// =============================================
window.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      15%      { transform: translateX(-8px); }
      30%      { transform: translateX(8px); }
      45%      { transform: translateX(-6px); }
      60%      { transform: translateX(6px); }
      75%      { transform: translateX(-3px); }
      90%      { transform: translateX(3px); }
    }
  `;
  document.head.appendChild(style);

  const regBtn = document.getElementById("regBtn");
  if (regBtn) regBtn.onclick = registerUser;
  if (document.getElementById("step-register")) showStep("step-register");

  const loginBtn  = document.getElementById("loginBtn");
  const googleBtn = document.getElementById("googleBtn");
  if (loginBtn)  loginBtn.onclick  = loginUser;
  if (googleBtn) googleBtn.onclick = loginWithGoogle;
  if (document.getElementById("step-login")) showStep("step-login");

  document.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    if (document.getElementById("regBtn"))   registerUser();
    if (document.getElementById("loginBtn")) loginUser();
  });

  auth.onAuthStateChanged(user => {
    const loginBtn     = document.getElementById("loginBtn");
    const navUser      = document.getElementById("navUser");
    const navUsername  = document.getElementById("navUsername");
    const navLogout    = document.getElementById("navLogout");
    const navLogoutBtn = document.getElementById("navLogoutBtn");

    if (user) {
      if (loginBtn)     loginBtn.style.display = "none";
      if (navUser)      navUser.classList.add("show");
      if (navUsername)  navUsername.innerText = user.displayName || user.email;
      if (navLogout)    navLogout.onclick = () => auth.signOut().then(() => location.reload());
      if (navLogoutBtn) {
        navLogoutBtn.innerText = "Logout (" + (user.displayName || user.email) + ")";
        navLogoutBtn.onclick = () => auth.signOut().then(() => location.reload());
      }
    } else {
      if (loginBtn) loginBtn.style.display = "";
      if (navUser)  navUser.classList.remove("show");
    }
  });
});