const format = require("pg-format");
const db = require("../db/connection.js");
const { insertToTable } = require("../db/utils/sql-queries.js");
const {
  getSingleResult,
  getMultipleResults,
} = require("../helper-functions.js");

exports.selectUsers = async ({ sort_by, order, limit, p }) => {
  const validSortBy = ["username", "total_likes"];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  queryStr = `
    WITH total AS (
      SELECT owner, votes
      FROM reviews
      UNION ALL
      SELECT author AS owner, votes
      FROM comments
    )
    SELECT username, SUM(votes) AS total_likes, avatar_url, name
    FROM total
    RIGHT JOIN users ON total.owner = users.username
    GROUP BY username
    ORDER BY ${sort_by} ${order} NULLS LAST;
  `;

  return getMultipleResults(queryStr);
};

exports.selectUserByUsername = async (username) => {
  queryStr = `
    WITH total AS (
      SELECT owner, votes
      FROM reviews
      UNION ALL
      SELECT author AS owner, votes
      FROM comments
    )
    SELECT username, SUM(votes) AS total_likes, avatar_url, name
    FROM total
    RIGHT JOIN users ON total.owner = users.username
    WHERE username = $1
    GROUP BY username;
  `;

  return getSingleResult(queryStr, [username]);
};

exports.checkUserCredentials = async (username) => {
  queryStr = `
    SELECT username, password
    FROM users
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

exports.updateUserByUsername = async (username, body) => {
  let pairs = Object.entries(body).filter((pair) => {
    const [, value] = pair;
    return value;
  });

  if (pairs.length < 1) {
    return Promise.reject({ status: 400, message: "Missing required fields" });
  }

  let queryStr = `
    UPDATE users 
    SET `;

  pairs.forEach((pair) => {
    const [key, value] = pair;
    queryStr += format(`%I = %L, `, key, value);
  });

  queryStr = queryStr.slice(0, -2);

  queryStr += `
    WHERE username = $1
    RETURNING *;
  `;

  return getSingleResult(queryStr, [username]);
};
