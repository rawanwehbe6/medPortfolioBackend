const express = require("express");
const app = express();

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
