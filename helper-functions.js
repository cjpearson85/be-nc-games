const db = require("./db/connection.js");

exports.getMultipleResults = async (str, arr = []) => {
  const { rows } = await db.query(str, arr);
  return rows;
};

exports.getSingleResult = async (str, arr = []) => {
  const { rows } = await db.query(str, arr);
  return rows[0] ? rows[0] : Promise.reject({ status: 404 });
};
