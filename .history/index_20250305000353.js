require('dotenv').config(); // Load environment variables
const express = require("express");
const pool = require('./config/db');
const app = express();
const authRoutes = require('./routes/authRoutes');
const keyCompetenciesRoutes = require('./routes/keyCompetenciesRoutes');
const { testConnection } = require('./testing/dbtest');

// Use express.json() to parse incoming JSON requests
app.use(express.json());  // This should be placed before any route handling

// Mount the authentication routes
app.use('/auth', authRoutes);  // Any routes prefixed with '/auth' will be handled by authRoutes
app.use('/api/keyCompetencies', keyCompetenciesRoutes);

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

// Start the server
const PORT = process.env.PORT || 1000;

app.get('/tdb', testConnection);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
