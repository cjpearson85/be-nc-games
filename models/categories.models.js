const db = require("../db/connection.js");
const { insertToTable } = require("../db/utils/sql-queries.js");

exports.selectCategories = async () => {
  const { rows } = await db.query(
    `SELECT * FROM categories ORDER BY slug ASC;`
  );
  return rows;
};

exports.insertCategory = async (body) => {
  const columns = Object.keys(body);
  const values = Object.values(body);

  if (!columns.includes("slug")) {
    return Promise.reject({ status: 400, message: "No slug on POST body" });
  }

  let queryStr = insertToTable("categories", columns, [values]);
  queryStr += ` RETURNING *`;

  const { rows } = await db.query(queryStr);

  return rows[0];
};
