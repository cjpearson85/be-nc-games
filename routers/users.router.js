const { getUsers, getUserByUsername, postUser } = require("../controllers/users.controllers");

const usersRouter = require("express").Router();

usersRouter.route('/').get(getUsers).post(postUser);
usersRouter.route('/:username').get(getUserByUsername);

module.exports = usersRouter;
