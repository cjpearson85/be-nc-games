const {
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("../controllers/comments.controllers");
const {
  getReviewById,
  patchReviewById,
  getReviews,
  postReview,
} = require("../controllers/reviews.controllers");

const reviewsRouter = require("express").Router();

reviewsRouter
  .route("/")
  .get(getReviews)
  .post(postReview);

reviewsRouter
  .route("/:review_id")
  .get(getReviewById)
  .patch(patchReviewById);
  
reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId);

module.exports = reviewsRouter;
