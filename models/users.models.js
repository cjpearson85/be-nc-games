const db = require("../db/connection.js");

exports.selectUsers = async () => {
  const { rows } = await db.query(`
    SELECT * FROM users
    ORDER BY username ASC;
  `);
  return rows;
};

exports.selectUserByUsername = async (username) => {
  const { rows } = await db.query(`
    SELECT * FROM users
    WHERE username = $1;
  `, [username]
  );

  if (!rows[0]) {
    return Promise.reject({ status: 404, message: "User not found" });
  }
  
  return rows[0];
};
