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
  res.send('auth service alive');
});

app.post('/register', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const [result] = await db.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, 'temp']
    );

    res.json({
      message: 'user created',
      userId: result.insertId,
      username
    });
  } catch (error) {
    console.error("register failed:", error.message);

    res.status(500).json({
      error: "register failed",
      details: error.message
    });
  }
});

app.listen(4001, () => console.log('auth running on 4001'));
