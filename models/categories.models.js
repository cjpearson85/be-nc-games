const db = require("../db/connection.js");

exports.selectCategories = async () => {
  const { rows } = await db.query(
    `SELECT * FROM categories ORDER BY slug ASC;`
  );
  return rows;
};

exports.insertCategory = async (body) => {
  const { slug, description } = body;

  if (!slug) {
    return Promise.reject({ status: 400, message: "No slug on POST body" });
  }

  let queryStr = `
    INSERT INTO categories
    (slug, description)
    VALUES
    ($1, $2)
    RETURNING *`;

  const { rows } = await db.query(queryStr, [slug, description]);

  return rows[0];
};
