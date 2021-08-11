const { getUsers, getUserByUsername, postUser, patchUserByUsername } = require("../controllers/users.controllers");

const usersRouter = require("express").Router();

usersRouter.route('/').get(getUsers).post(postUser);
usersRouter.route('/:username').get(getUserByUsername).patch(patchUserByUsername);

module.exports = usersRouter;
