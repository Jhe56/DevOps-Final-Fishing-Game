const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const locations = ["Lake", "River", "Ocean"];

function rollRarity() {
  const roll = Math.random() * 100;

  if (roll < 70) return "common";
  if (roll < 93) return "uncommon";
  return "rare";
}

app.get("/", (req, res) => {
  res.send("gameplay service alive");
});

app.get("/locations", (req, res) => {
  res.json(locations);
});

app.get("/fish", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name, location, rarity FROM fish_species ORDER BY location, rarity"
  );

  res.json(rows);
});

app.post("/catch", async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ error: "userId and location are required" });
    }

    const rarity = rollRarity();

    const [fishRows] = await db.query(
      "SELECT id, name, location, rarity FROM fish_species WHERE location = ? AND rarity = ? LIMIT 1",
      [location, rarity]
    );

    if (fishRows.length === 0) {
      return res.status(404).json({ error: "no fish found" });
    }

    const fish = fishRows[0];

    await db.query(
      "INSERT INTO catches (user_id, fish_id) VALUES (?, ?)",
      [userId, fish.id]
    );

    await db.query(
      `INSERT INTO inventory (user_id, fish_id, quantity)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
      [userId, fish.id]
    );

    res.json({
      message: "fish caught",
      fish
    });
  } catch (error) {
    console.error("catch failed:", error.message);

    res.status(500).json({
      error: "catch failed",
      details: error.message
    });
  }
});

app.listen(4002, () => {
  console.log("gameplay running on 4002");
});
