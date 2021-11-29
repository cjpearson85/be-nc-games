const {
  getUsers,
  getUserByUsername,
  patchUserByUsername,
  authoriseUser,
} = require("../controllers/users.controllers");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);
usersRouter.get("/:username", getUserByUsername);

usersRouter.use(authoriseUser);
usersRouter.patch("/:username", patchUserByUsername);

module.exports = usersRouter;
