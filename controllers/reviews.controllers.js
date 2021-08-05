const {
  selectReviewById,
  updateReviewById,
  selectReviews,
  selectCommentsByReviewId,
} = require("../models/reviews.models");

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category, limit, p } = req.query;
  const queries = {
    sort_by: sort_by || "created_at",
    order: order || "desc",
    category,
    limit: limit || 10,
    p: p || 1,
  };

  selectReviews(queries)
    .then(({ rows: reviews, rowCount: total_count }) => {
      res.status(200).send({ total_count, reviews });
    })
    .catch(next);
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.patchReviewById = (req, res, next) => {
  const { review_id } = req.params;
  const { body } = req;
  updateReviewById(review_id, body)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};
