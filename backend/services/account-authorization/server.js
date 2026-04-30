const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
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
  const { username } = req.body;

  await db.query(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, 'temp']
  );

  res.send('user created');
});

app.listen(4001, () => console.log('auth running on 4001'));
