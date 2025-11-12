require("dotenv").config();
const Sequelize = require("sequelize");

console.log("DB: ", process.env.DATABASE);
console.log("USER: ", process.env.USER);
console.log("PASS: ", process.env.PASS);
console.log("HOST", process.env.HOST);

const db = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASS,
  {
    host: process.env.HOST,
    dialect: "mysql",
  }
);

try {
  db.authenticate();
  console.log("Connection has established successfully");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

module.exports = db;
