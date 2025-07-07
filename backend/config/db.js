const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection
pool
  .getConnection()
  .then((connection) => {
    console.log("MySQL Database connected successfully!");
    connection.release();
  })
  .catch((error) => {
    console.error("Error connecting to MySQL database:", error);
    // Exit process with failure
    process.exit(1);
  });

module.exports = pool;
