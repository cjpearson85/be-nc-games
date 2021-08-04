const db = require("../db/connection.js");

exports.selectReviews = async ({ sort_by, order, category }) => {
  const validSortBy = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  const { rows: categories} = await db.query(`SELECT category FROM reviews;`)

  if (!categories.map(row => row.category).includes(category) && category !== undefined) {
    return Promise.reject({ status: 404, message: "Category not found" });
  }

  let queryValues = [];
  let queryStr = `
    SELECT owner, title, reviews.review_id, category,review_img_url, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id`;

  if (category) {
    queryStr += ` WHERE category = $1`;
    queryValues.push(category);
  }

  queryStr += ` 
    GROUP BY reviews.review_id
    ORDER BY ${sort_by} ${order};`;

  const { rows } = await db.query(queryStr, queryValues);

  return rows;
};

exports.selectReviewById = async (review_id) => {
  const { rows } = await db.query(
    `SELECT owner, title, reviews.review_id, review_body, designer, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;`,
    [review_id]
  );
  if (!rows[0]) {
    return Promise.reject({ status: 404, message: "Review does not exist" });
  }
  return rows[0];
};

exports.updateReviewById = async (review_id, body) => {
  const { rows } = await db.query(
    `UPDATE reviews
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *`,
    [body.inc_votes, review_id]
  );
  if (!rows[0]) {
    return Promise.reject({ status: 404, message: "Review does not exist" });
  }
  return rows[0];
  // Update this to make sure votes doesn't become a negative number
};
