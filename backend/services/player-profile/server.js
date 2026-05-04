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

app.get("/", (req, res) => {
  res.send("player-profile alive");
});

// get inventory
app.get("/inventory/:userId", async (req, res) => {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch inventory" });
  }
});

// get stats
app.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT fs.name, COUNT(c.id) AS total_caught
       FROM catches c
       JOIN fish_species fs ON c.fish_id = fs.id
       WHERE c.user_id = ?
       GROUP BY fs.name`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch stats" });
  }
});

app.listen(4003, () => {
  console.log("player-profile running on 4003");
});