const db = require("../db/connection.js");
const { insertToTable } = require("../db/utils/sql-queries.js");

exports.selectCommentsByReviewId = async (review_id, queries) => {
  const { sort_by, order, limit, p } = queries;
  const queryValues = [review_id];

  const result = await db.query(`SELECT review_id FROM reviews;`);
  const validIDs = result.rows.map(id => id.review_id);

  if (Object.is(parseInt(review_id), NaN)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  if (!validIDs.includes(parseInt(review_id))) {
    return Promise.reject({ status: 404, message: "Review not found" });
  }

  const validSortBy = [
    "comment_id",
    "author",
    "created_at",
    "votes"
  ];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  let queryStr = `
    SELECT comment_id, votes, created_at, author, body 
    FROM comments
    WHERE review_id = $1 
    ORDER BY ${sort_by} ${order}`;

  const { rowCount } = await db.query(queryStr, queryValues);
  
  queryStr += ` LIMIT $2 OFFSET $3;`;

  const offset = (p - 1) * limit;
  queryValues.push(limit);
  queryValues.push(offset);

  const { rows } = await db.query(queryStr, queryValues);

  return { rows, rowCount };
};

exports.insertCommentByReviewId = async (review_id, body) => {
  body.review_id = review_id;
  const columns = Object.keys(body);
  const values = Object.values(body);

  if (values.some(el => el === undefined)) {
    return Promise.reject({ status: 400, message: "Missing required fields" });
  }

  if (Object.is(parseInt(review_id), NaN)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  let queryStr = insertToTable("comments", columns, [values]);
  queryStr += `RETURNING *;`;

  const { rows } = await db.query(queryStr);

  return rows[0];
};

exports.removeCommentById = async (comment_id) => {
  if (Object.is(parseInt(comment_id), NaN)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  const { rows } = await db.query(`
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING comment_id;`,
    [comment_id]
  );

  if (!rows[0]) {
    return Promise.reject({ status: 404, message: "Comment does not exist" });
  }
  return rows[0];
};

exports.updateCommentById = async (comment_id, body) => {
  if (Object.is(parseInt(comment_id), NaN)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  } else if (!body.inc_votes) {
    return Promise.reject({ status: 400, message: "Missing required fields" });
  }

  const { rows } = await db.query(
    `UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *`,
    [body.inc_votes, comment_id]
  );
  if (!rows[0]) {
    return Promise.reject({ status: 404, message: "Comment does not exist" });
  }
  return rows[0];
};
