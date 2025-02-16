const pool = require('../config/db'); // Assuming you're using a pool from a separate db.js file

// Test database connection with a simple query
async function testConnection(req, res) {
  try {
    const result = await pool.execute('SELECT 1');
    console.log('Raw DB result:', result);  // Log the entire result to see its structure
    return res.status(200).json({ message: 'Database connection successful', result });
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
    return res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
}


module.exports = { testConnection };