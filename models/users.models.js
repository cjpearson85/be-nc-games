const db = require("../db/connection.js");
const { getSingleResult, getMultipleResults } = require("../helper-functions.js");

exports.selectUsers = async () => {
  queryStr = `
  SELECT * FROM users
  ORDER BY username ASC;
  `
  return getMultipleResults(queryStr)
};

exports.selectUserByUsername = async (username) => {
  queryStr = `
  SELECT * FROM users
  WHERE username = $1;
  `
  return getSingleResult(queryStr, [username])
};
