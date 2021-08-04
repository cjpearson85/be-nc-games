const {
  getReviewById,
  patchReviewById,
  getReviews,
  getCommentsByReviewId,
} = require("../controllers/reviews.controllers");

const reviewsRouter = require("express").Router();

reviewsRouter.route("/").get(getReviews);
reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReviewById);
reviewsRouter.route("/:review_id/comments").get(getCommentsByReviewId);

module.exports = reviewsRouter;
