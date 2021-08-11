const db = require("../db/connection.js");
const { insertToTable } = require("../db/utils/sql-queries.js");
const {
  getSingleResult,
  getMultipleResults,
} = require("../helper-functions.js");

exports.selectUsers = async () => {
  queryStr = `
  SELECT * FROM users
  ORDER BY username ASC;
  `;
  return getMultipleResults(queryStr);
};

exports.selectUserByUsername = async (username) => {
  queryStr = `
  SELECT * FROM users
  WHERE username = $1;
  `;
  return getSingleResult(queryStr, [username]);
};

exports.insertUser = async (body) => {
  const columns = Object.keys(body);
  const values = Object.values(body);

  let queryStr = insertToTable("users", columns, [values]);
  queryStr += ` RETURNING *`;

  return getSingleResult(queryStr);
};
