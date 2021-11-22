const {
  deleteCommentById,
  patchCommentById,
} = require("../controllers/comments.controllers");
const { authoriseUser } = require("../controllers/users.controllers");

const commentsRouter = require("express").Router();

commentsRouter.use(authoriseUser);
commentsRouter
  .route("/:comment_id")
  .patch(patchCommentById)
  .delete(deleteCommentById);

module.exports = commentsRouter;
