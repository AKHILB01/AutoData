const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",       // your db user
  host: "localhost",      // db host
  database: "autoform",   // db name
  password: "yourpassword", // db password
  port: 5432              // default Postgres port
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err));

module.exports = pool;
