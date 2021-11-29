const {
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("../controllers/comments.controllers");
const {
  getReviewById,
  patchReviewById,
  getReviews,
  postReview,
  deleteReviewById,
} = require("../controllers/reviews.controllers");
const { authoriseUser } = require("../controllers/users.controllers");

const reviewsRouter = require("express").Router();

reviewsRouter.get("/", getReviews);
reviewsRouter.get("/:review_id", getReviewById);
reviewsRouter.get("/:review_id/comments", getCommentsByReviewId);

reviewsRouter.use(authoriseUser);

reviewsRouter.post("/", postReview);
reviewsRouter
  .route("/:review_id")
  .patch(patchReviewById)
  .delete(deleteReviewById);
reviewsRouter.post("/:review_id/comments", postCommentByReviewId);

module.exports = reviewsRouter;
