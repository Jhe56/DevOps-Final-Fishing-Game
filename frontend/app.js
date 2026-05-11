const AUTH = "/api/auth";
const GAME = "/api/gameplay";
const PROFILE = "/api/profile";

let userId = localStorage.getItem("userId");

// ---------- MODALS ----------

function showRegister() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("registerModal").style.display = "block";
}

function showLogin() {
  document.getElementById("registerModal").style.display = "none";
  document.getElementById("loginModal").style.display = "block";
}

function closeModals() {
  document.getElementById("registerModal").style.display = "none";
  document.getElementById("loginModal").style.display = "none";
}

window.onclick = function(event) {
  if (event.target.className === "modal") closeModals();
};

// ---------- AUTH ----------

async function register() {
  const username = document.getElementById("reg-username");
  const password = document.getElementById("reg-password");

  const res = await fetch(`${AUTH}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username: username.value, password: password.value })
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (data.userId) {
    userId = data.userId;
    localStorage.setItem("userId", userId);
    loadProfile();

    username.value = "";
    password.value = "";
    closeModals();
  }
}

async function login() {
  const username = document.getElementById("login-username");
  const password = document.getElementById("login-password");

  const res = await fetch(`${AUTH}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username: username.value, password: password.value })
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (data.userId) {
    userId = data.userId;
    localStorage.setItem("userId", userId);
    loadProfile();

    username.value = "";
    password.value = "";
    closeModals();
  }
}

// ---------- GAMEPLAY ----------

async function catchFish() {
  if (!userId) return alert("Login first");

  const location = document.getElementById("location").value;

  const res = await fetch(`${GAME}/catch`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ userId, location })
  });

  const data = await res.json();

  alert(data.message);

  await loadProfile();
}
// ---------- INVENTORY ----------

const rarityColors = {
  common: "white",
  uncommon: "limegreen",
  rare: "cyan",
  epic: "gold"
};

async function loadInventory() {
  if (!userId) return alert("Login first");

  const res = await fetch(`${PROFILE}/inventory/${userId}`);
  const data = await res.json();

  const list = document.getElementById("inventory");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} (${item.rarity}) x${item.quantity}`;
    li.style.color = rarityColors[item.rarity] || "white";
    list.appendChild(li);
  });
}

// ---------- PROFILE ----------

async function loadProfile() {
  const res = await fetch(`${PROFILE}/profile/${userId}`);
  const data = await res.json();

  document.getElementById("profile").innerText =
    `${data.username} - ${data.title}`;
}

// ---------- SHOP ----------

function goToShop() {
  window.location.href = "shop.html";
}