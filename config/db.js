const mysql = require("mysql2");
require("dotenv").config({ path: "./Database.env" });

const pool = mysql
  .createPool({
    host: process.env.DB_HOST, // localhost
    user: process.env.DB_USER, // root
    password: process.env.DB_PASSWORD, // root
    database: process.env.DB_NAME, // medportfolio
    port: process.env.DB_PORT, // 3306
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

module.exports = pool;