const db = require("./db/connection.js");
const bcrypt = require("bcrypt");

exports.getMultipleResults = async (str, arr = []) => {
  const { rows } = await db.query(str, arr);
  return rows;
};

exports.getSingleResult = async (str, arr = []) => {
  const { rows } = await db.query(str, arr);
  return rows[0] ? rows[0] : Promise.reject({ status: 404 });
};

exports.hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

exports.comparePasswords = async (password, hashedPassword) => {
  const passwordOk = await bcrypt.compare(password, hashedPassword);
  return passwordOk;
};
