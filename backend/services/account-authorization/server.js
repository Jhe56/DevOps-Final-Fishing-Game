const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require("bcryptjs");
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

// health check
app.get('/', (req, res) => {
  res.send('auth service alive');
});

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernamePattern.test(username)) { 
      return res.status(400).json({ 
        error: "Username must be 3-20 characters and only use letters, numbers, _ or -" 
      }); 
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,64}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        error:
          "Password must be 8-64 characters and include at least one letter and one number"
      });
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hashedPassword]
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

    const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernamePattern.test(username)) { 
      return res.status(400).json({ 
        error: "Username must be 3-20 characters and only use letters, numbers, _ or -" 
      }); 
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,64}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        error:
          "Password must be 8-64 characters and include at least one letter and one number"
      });
    }

    const [rows] = await db.query(
      'SELECT id, password_hash, title FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
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