const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
} = require("../models/comments.models");

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  selectCommentsByReviewId(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  const { body } = req;
  insertCommentByReviewId(review_id, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};