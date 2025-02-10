const express = require('express');
const pool = require('./config/db');
require('dotenv').config({ path: './Database.env' });

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES;');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
