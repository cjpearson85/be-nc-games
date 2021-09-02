const {
  selectUsers,
  selectUserByUsername,
  insertUser,
  updateUserByUsername,
} = require("../models/users.models");

exports.getUsers = (req, res, next) => {
  const { sort_by, order, limit, p } = req.query;
  const queries = {
    sort_by: sort_by || "username",
    order: order || "asc",
    limit: limit || 10,
    p: p || 1,
  };

  selectUsers(queries)
    .then((users) => {
      users = users.map(user => {
        user.total_likes = +user.total_likes;
        return user
      })
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

exports.patchUserByUsername = (req, res, next) => {
  const { username } = req.params;
  const { avatar_url, name } = req.body;

  updateUserByUsername(username, { avatar_url, name })
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (!err.message) err.message = "User not found";
      next(err);
    });
};
