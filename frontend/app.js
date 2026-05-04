const AUTH = "http://localhost:4001";
const GAME = "http://localhost:4002";
const PROFILE = "http://localhost:4003";

let userId = localStorage.getItem("userId");

async function register() {
  const username = document.getElementById("username").value;

  const res = await fetch(`${AUTH}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  const data = await res.json();

  if (data.userId) {
    userId = data.userId;
    localStorage.setItem("userId", userId);
    alert(`registered as ${data.username}, user id ${data.userId}`);
  } else {
    alert(JSON.stringify(data));
  }
}

async function catchFish() {
  if (!userId) {
    alert("Register first");
    return;
  }

  const location = document.getElementById("location").value;

  const res = await fetch(`${GAME}/catch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, location })
  });

  const data = await res.json();
  alert(JSON.stringify(data));
}

async function loadInventory() {
  if (!userId) {
    alert("Register first");
    return;
  }

  const res = await fetch(`${PROFILE}/inventory/${userId}`);
  const data = await res.json();

  const list = document.getElementById("inventory");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} (${item.location}, ${item.rarity}) x${item.quantity}`;
    list.appendChild(li);
  });
}