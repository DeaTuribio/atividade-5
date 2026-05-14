const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  quiet: true,
  path: path.resolve(__dirname, "..", "..", ".env"),
});

const { Pool } = require("pg");

let config;

if (process.env.DATABASE_URL) {
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Necessário para bancos de dados na nuvem como no Render
  };
} else {
  config = {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: Number(process.env.POSTGRES_PORT || 5432),
  };
}

const pool = new Pool(config);


module.exports = pool;
