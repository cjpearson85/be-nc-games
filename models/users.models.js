const db = require("../db/connection.js");

exports.selectUsers = async () => {
  const { rows } = await db.query(`
    SELECT * FROM users;
  `);
  return rows;
};
