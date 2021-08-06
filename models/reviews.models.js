const db = require("../db/connection.js");

exports.selectReviews = async ({ sort_by, order, category, limit, p }) => {
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

  const { rows: categories } = await db.query(`SELECT category FROM reviews;`);

  if (
    !categories.map((row) => row.category).includes(category) &&
    category !== undefined
  ) {
    return Promise.reject({ status: 404, message: "Category not found" });
  }

  let queryValues = [];
  let queryStr = `
    SELECT owner, title, reviews.review_id, category,review_img_url, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id`;

  let queryCount = 1;

  if (category) {
    queryStr += ` WHERE category = $${queryCount}`;
    queryValues.push(category);
    queryCount++;
  }

  queryStr += ` 
    GROUP BY reviews.review_id
    ORDER BY ${sort_by} ${order} `;

  const { rowCount } = await db.query(queryStr, queryValues);

  queryStr += `LIMIT $${queryCount} `;

  queryValues.push(limit);
  queryCount++;

  queryStr += `OFFSET $${queryCount};`;

  const offset = (p - 1) * limit;
  queryValues.push(offset);

  const { rows } = await db.query(queryStr, queryValues);

  return { rows, rowCount };
};

exports.insertReview = async (body) => {
  const { owner, title, review_body, designer, category } = body;
  const queryValues = [
    owner,
    title,
    review_body,
    designer,
    category,
  ];

  if (queryValues.some(el => el === undefined)) {
    return Promise.reject({ status: 400, message: "Missing required fields" });
  }

  let queryStr = `
    INSERT INTO reviews
    (owner, title, review_body, designer, category)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING review_id`;

  const result = await db.query(queryStr, queryValues);

  const { review_id } = result.rows[0];

  return this.selectReviewById(review_id);
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
    return Promise.reject({ status: 404, message: "Review not found" });
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

exports.removeReviewById = async (review_id) => {
  return db.query(`
    DELETE FROM reviews
    WHERE review_id = $1;`,
    [review_id]
  );
}