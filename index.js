require('dotenv').config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const pool = require('./config/db');
const auth = require("./middleware/auth");
const app = express();
const authRoutes = require("./routes/authRoutes");
const keyCompetenciesRoutes = require("./routes/keyCompetenciesRoutes");
const AccomplishmentRoutes = require("./routes/AccomplishmentRoutes");
const { testConnection } = require("./testing/dbtest");
const elearningRoutes = require("./routes/elearningRoutes");
const educationalActivitiesRoutes = require("./routes/educationalActivitiesRoutes");
const surgicalExperienceRoutes = require("./routes/surgicalExperienceRoutes");
const bodyParser = require("body-parser");
const researchRoutes = require("./routes/researchRoutes");
const supervisor = require("./routes/supervisorRoutes");
const portfolio = require("./routes/portfolioRoutes");
const trainee = require("./routes/TraineeRoutes");
const admin = require("./routes/AdminRoutes");
const formRoutes = require("./routes/formRoutes");
const messagesRoutes = require("./routes/messages_notificationsRoutes");
const taskRoutes = require("./routes/taskRoutes");
const portfolioImageRoutes = require("./routes/portfolioImageRoutes");
const logbookRoutes = require("./routes/logbookRoutes");
//rimas testing
const path = require("path");

// Use express.json() to parse incoming JSON requests
app.use(express.json()); // This should be placed before any route handling
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Mount the authentication routes
app.use("/auth", authRoutes); // Any routes prefixed with '/auth' will be handled by authRoutes
app.use("/api/keyCompetencies", keyCompetenciesRoutes);
app.use("/api/Accomplishment", AccomplishmentRoutes);
app.use("/api/surgical-experiences", surgicalExperienceRoutes);
app.use("/api", researchRoutes);
app.use("/api/supervisor", supervisor);
app.use("/api/trainee", trainee);
app.use("/api/admin", admin);
app.use("/api/messages", messagesRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/portfolio", portfolio);
// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Mount the elearning routes
app.use("/api/elearning-materials", elearningRoutes);

// Mount the educational Activities routes
app.use("/api/educational-activities", educationalActivitiesRoutes);

// Mount form routes
app.use("/api/forms", formRoutes);

//Mount trainee portfolio image upload
app.use("/api/portfolio", portfolioImageRoutes);

// Mount logbook routes
app.use("/api", logbookRoutes);

// Start the server
const PORT = process.env.PORT || 3000;

app.get("/tdb", testConnection);

// rimas testing
// Serve the uploads folder as static
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/uploads", auth("Bypass"), express.static("uploads"));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
