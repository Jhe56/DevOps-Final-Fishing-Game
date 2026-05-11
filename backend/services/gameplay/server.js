const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

function titleForCounts(common, uncommon, rare) {
  if (rare >= 10) return "Rare Fish Champion";
  if (uncommon >= 10) return "Seasoned Angler";
  if (common >= 10) return "Pond Pro";
  return "Rookie Angler";
}

app.get('/', (req, res) => {
  res.send('gameplay service alive');
});

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/locations', (req, res) => {
  res.json(["Lake", "River", "Ocean"]);
});

app.get('/fish', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM fish_species');
  res.json(rows);
});

function rollRarity() {
  const r = Math.random();
  if (r < 0.6) return 'common';
  if (r < 0.9) return 'uncommon';
  return 'rare';
}

function rollFrenzy() {
  return Math.random() < 0.1; // 10% chance
}

// CATCH FISH
app.post('/catch', async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ error: "userId and location required" });
    }

    const rarity = rollRarity();

    const [fishRows] = await db.query(
      'SELECT id, name FROM fish_species WHERE location = ? AND rarity = ? LIMIT 1',
      [location, rarity]
    );

    if (fishRows.length === 0) {
      return res.status(404).json({ error: "no fish found" });
    }

    const fish = fishRows[0];

    const frenzy = rollFrenzy();
    const quantity = frenzy ? 3 : 1;

    await db.query(
      'INSERT INTO catches (user_id, fish_id, quantity) VALUES (?, ?, ?)',
      [userId, fish.id, quantity]
    );

    await db.query(
      `INSERT INTO inventory (user_id, fish_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, fish.id, quantity, quantity]
    );

    const rarityColumn =
      rarity === "common"
        ? "common_caught"
        : rarity === "uncommon"
          ? "uncommon_caught"
          : "rare_caught";

      await db.query(
        `UPDATE users SET ${rarityColumn} = ${rarityColumn} + 1 WHERE id = ?`,
        [userId]
      );

      const [countRows] = await db.query(
        `SELECT common_caught, uncommon_caught, rare_caught FROM users WHERE id = ?`,
        [userId]
      );

      const counts = countRows[0];

      const newTitle = titleForCounts(
        counts.common_caught,
        counts.uncommon_caught,
        counts.rare_caught
      );

      await db.query(
        `UPDATE users SET title = ? WHERE id = ?`,
        [newTitle, userId]
      );

    res.json({
      message: frenzy
        ? `Fishing Frenzy! You caught ${fish.name} (${rarity}) x${quantity}`
        : `You caught a ${fish.name} (${rarity}) x${quantity}`,
      fish: fish.name,
      rarity,
      quantity,
      frenzy
    });

  } catch (error) {
    console.error("catch failed:", error.message);
    res.status(500).json({ error: "catch failed" });
  }
});

app.listen(4002, () => {
  console.log('gameplay running on 4002');
});