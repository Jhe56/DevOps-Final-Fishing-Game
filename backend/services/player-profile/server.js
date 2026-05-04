const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.get('/', (req, res) => {
  res.send('player-profile service alive');
});

// INVENTORY
app.get('/inventory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT fs.name, fs.location, fs.rarity, i.quantity
       FROM inventory i
       JOIN fish_species fs ON i.fish_id = fs.id
       WHERE i.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("inventory failed:", error.message);
    res.status(500).json({ error: "inventory failed" });
  }
});

// STATS (total caught per fish)
app.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT fs.name, SUM(c.quantity) AS total_caught
       FROM catches c
       JOIN fish_species fs ON c.fish_id = fs.id
       WHERE c.user_id = ?
       GROUP BY fs.name`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("stats failed:", error.message);
    res.status(500).json({ error: "stats failed" });
  }
});

// GET USER PROFILE (username + title)
app.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      'SELECT username, title FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("profile failed:", error.message);
    res.status(500).json({ error: "profile failed" });
  }
});

// SHOP: unlock title if enough fish
app.post('/unlock-title', async (req, res) => {
  try {
    const { userId, titleName } = req.body;

    const [[title]] = await db.query(
      'SELECT required_fish_count FROM titles WHERE name = ?',
      [titleName]
    );

    if (!title) {
      return res.status(404).json({ error: "title not found" });
    }

    const [[total]] = await db.query(
      'SELECT SUM(quantity) AS total FROM catches WHERE user_id = ?',
      [userId]
    );

    const totalCaught = total.total || 0;

    if (totalCaught < title.required_fish_count) {
      return res.json({
        message: "Not enough fish to unlock this title"
      });
    }

    await db.query(
      'UPDATE users SET title = ? WHERE id = ?',
      [titleName, userId]
    );

    res.json({ message: `Unlocked title: ${titleName}` });

  } catch (error) {
    console.error("unlock failed:", error.message);
    res.status(500).json({ error: "unlock failed" });
  }
});

app.listen(4003, () => {
  console.log('player-profile running on 4003');
});