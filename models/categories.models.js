const db = require("../db/connection.js");
const { insertToTable } = require("../db/utils/sql-queries.js");
const { getSingleResult, getMultipleResults } = require("../helper-functions.js");

exports.selectCategories = async () => {
  let queryStr = `SELECT * FROM categories ORDER BY slug ASC;`;
  return getMultipleResults(queryStr);
};

exports.insertCategory = async (body) => {
  const columns = Object.keys(body);
  const values = Object.values(body);

  if (!columns.includes("slug")) {
    return Promise.reject({ status: 400, message: "No slug on POST body" });
  }

  let queryStr = insertToTable("categories", columns, [values]);
  queryStr += ` RETURNING *`;

  return getSingleResult(queryStr);
};
