const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
  removeCommentById,
  updateCommentById,
} = require("../models/comments.models");

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  const {
    sort_by = "created_at",
    order = "desc",
    limit = 10,
    p = 1,
  } = req.query;

  selectCommentsByReviewId(review_id, { sort_by, order, limit, p })
    .then(({ rows: comments, rowCount: total_count }) => {
      res.status(200).send({ total_count, comments });
    })
    .catch(next);
};

exports.postCommentByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  const { author, body } = req.body;

  insertCommentByReviewId(review_id, { author, body })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      if (!err.message) err.message = "Comment not found";
      next(err);
    });
};

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { body, inc_votes: votes } = req.body;

  updateCommentById(comment_id, { body, votes })
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      if (!err.message) err.message = "Comment not found";
      next(err);
    });
};
