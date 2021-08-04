const db = require("../db/connection.js");

exports.selectCategories = async () => {
  const { rows } = await db.query(`SELECT * FROM categories;`);
  return rows;
};
