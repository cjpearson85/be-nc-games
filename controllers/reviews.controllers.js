const {
  selectReviewById,
  updateReviewById,
  selectReviews,
  selectCommentsByReviewId,
} = require("../models/reviews.models");

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category } = req.query;
  const queries = {
    sort_by: sort_by || "created_at",
    order: order || "desc",
    category,
  };

  selectReviews(queries)
    .then((reviews) => {
      res.status(200).send({ reviews });
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