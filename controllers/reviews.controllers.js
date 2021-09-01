const {
  selectReviewById,
  updateReviewById,
  selectReviews,
  insertReview,
  removeReviewById,
} = require("../models/reviews.models");

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category, title, owner, created_at, limit, p } = req.query;
  const queries = {
    sort_by: sort_by || "created_at",
    order: order || "desc",
    category,
    title,
    owner,
    created_at,
    limit: limit || 10,
    p: p || 1,
  };
  
  selectReviews(queries)
    .then(({ rows: reviews, rowCount: total_count }) => {
      res.status(200).send({ total_count, reviews });
    })
    .catch(next);
};

exports.postReview = (req, res, next) => {
  const { owner, title, review_body, designer, category } = req.body;

  insertReview({ owner, title, review_body, designer, category })
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch(next);
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      if (!err.message) err.message = "Review not found";
      next(err);
    });
};

exports.patchReviewById = (req, res, next) => {
  const { review_id } = req.params;
  const { review_body, inc_votes: votes } = req.body;

  updateReviewById(review_id, { review_body, votes })
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      if (!err.message) err.message = "Review not found";
      next(err);
    });
};

exports.deleteReviewById = (req, res, next) => {
  const { review_id } = req.params;
  removeReviewById(review_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      if (!err.message) err.message = "Review not found";
      next(err);
    });
};
