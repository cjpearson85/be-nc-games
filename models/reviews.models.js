const db = require("../db/connection.js");

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
    
}
