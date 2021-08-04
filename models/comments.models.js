const db = require("../db/connection.js");

exports.selectCommentsByReviewId = async (review_id) => {
  const { rows } = await db.query(
    `SELECT comment_id, votes, created_at, author, body FROM comments
    WHERE review_id = $1;`,
    [review_id]
  );

  return rows;
};

exports.insertCommentByReviewId = async (review_id, body) => {
  let queryStr = `
    INSERT INTO comments
    (author, review_id, body)
    VALUES
    ($1, $2, $3)
    RETURNING *;`;

  const { rows } = await db.query(queryStr, [
    body.author,
    review_id,
    body.body,
  ]);

  return rows[0];
};

exports.removeCommentById = async (comment_id) => {
  return db.query(`
    DELETE FROM comments
    WHERE comment_id = $1;`,
    [comment_id]
  );
};

exports.updateCommentById = async (comment_id, body) => {
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