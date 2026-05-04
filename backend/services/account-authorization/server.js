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

// health check
app.get('/', (req, res) => {
  res.send('auth service alive');
});

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }

    // check if username exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Username is already taken!" });
    }

    const [result] = await db.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, password]
    );

    res.json({
      message: "Registered successfully!",
      userId: result.insertId,
      username
    });

  } catch (error) {
    console.error("register failed:", error.message);
    res.status(500).json({ error: "register failed" });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      'SELECT id, password_hash, title FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = rows[0];

    if (user.password_hash !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({
      message: "Logged in successfully!",
      userId: user.id,
      username,
      title: user.title
    });

  } catch (error) {
    console.error("login failed:", error.message);
    res.status(500).json({ error: "login failed" });
  }
});

// UPDATE USERNAME
app.post('/update-username', async (req, res) => {
  try {
    const { userId, newUsername } = req.body;

    if (!userId || !newUsername) {
      return res.status(400).json({ error: "userId and newUsername required" });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [newUsername]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Username is already taken!" });
    }

    await db.query(
      'UPDATE users SET username = ? WHERE id = ?',
      [newUsername, userId]
    );

    res.json({ message: "Updated Username!" });

  } catch (error) {
    console.error("update failed:", error.message);
    res.status(500).json({ error: "update failed" });
  }
});

app.listen(4001, () => {
  console.log('auth running on 4001');
});