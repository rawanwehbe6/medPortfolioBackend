require('dotenv').config(); // Load environment variables
const express = require("express");
const pool = require('./config/db');
const app = express();
const authRoutes = require('./routes/authRoutes');
const keyCompetenciesRoutes = require('./routes/keyCompetenciesRoutes');
const AccomplishmentRoutes= require('./routes/AccomplishmentRoutes');
const { testConnection } = require('./testing/dbtest');
const elearningRoutes = require('./routes/elearningRoutes');
const educationalActivitiesRoutes = require('./routes/educationalActivitiesRoutes');
const surgicalExperienceRoutes = require('./routes/surgicalExperienceRoutes');
const bodyParser = require('body-parser');
const researchRoutes = require('./routes/researchRoutes');
const supervisor = require('./routes/supervisorRoutes');
const admin = require('./routes/AdminRoutes');
const formRoutes = require('./routes/formRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const taskRoutes = require('./routes/taskRoutes');
const portfolioImageRoutes = require('./routes/portfolioImageRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');


// Use express.json() to parse incoming JSON requests
app.use(express.json());  // This should be placed before any route handling
app.use(bodyParser.json());

// Mount the authentication routes
app.use('/auth', authRoutes);  // Any routes prefixed with '/auth' will be handled by authRoutes
app.use('/api/keyCompetencies', keyCompetenciesRoutes);
app.use('/api/Accomplishment', AccomplishmentRoutes);
app.use('/api/surgical-experiences', surgicalExperienceRoutes);
app.use('/api', researchRoutes);
app.use('/api/supervisor', supervisor);
app.use('/api/admin', admin);
app.use('/api/messages', messagesRoutes);
app.use('/api/tasks', taskRoutes);

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, Express!");
});

// Mount the elearning routes
app.use('/api/elearning-materials', elearningRoutes);

// Mount the educational Activities routes
app.use("/api/educational-activities", educationalActivitiesRoutes);

// Mount form routes
app.use('/api/forms', formRoutes);

//Mount trainee portfolio image upload
app.use('/api/portfolio', portfolioImageRoutes);

app.use('/api/portfolio', portfolioRoutes);
// Start the server
const PORT = process.env.PORT || 3000;

app.get('/tdb', testConnection);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
