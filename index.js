const express = require("express");
const pool = require('./config/db');
const app = express();
const authRoutes = require('./routes/authRoutes');

// Use express.json() to parse incoming JSON requests
app.use(express.json());  // This should be placed before any route handling

// Mount the authentication routes
app.use('/auth', authRoutes);  // Any routes prefixed with '/auth' will be handled by authRoutes

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

// Start the server
const PORT = process.env.PORT || 3000;

app.get('/test-db', async (req, res) => {
  try {
    // Use async/await for the query
    const [results] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ message: 'Database connected!', solution: results[0].solution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
