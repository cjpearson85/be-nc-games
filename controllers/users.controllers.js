const { selectUsers, selectUserByUsername, insertUser } = require("../models/users.models");

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  selectUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      err.message = "User not found";
      next(err);
    });
};

exports.postUser = (req, res, next) => {
  const { username, avatar_url, name } = req.body;

  insertUser({ username, avatar_url, name })
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch(next);
};
