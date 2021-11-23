const jwt = require("jsonwebtoken");
const { comparePasswords } = require("../helper-functions");
const {
  selectUsers,
  selectUserByUsername,
  insertUser,
  updateUserByUsername,
  checkUserCredentials,
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
      users = users.map((user) => {
        user.total_likes = +user.total_likes;
        return user;
      });
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
  const { username, avatar_url, name, password } = req.body;

  insertUser({ username, avatar_url, name, password })
    .then((user) => {
      const token = jwt.sign(
        { user: user.username, iat: Date.now() },
        process.env.JWT_SECRET
      );
      res.status(201).send({ user, token });
    })
    .catch(next);
};

exports.patchUserByUsername = (req, res, next) => {
  const { username } = req.params;
  const { avatar_url, name } = req.body;

  if (username === req.user) {
    updateUserByUsername(username, { avatar_url, name })
      .then((user) => {
        res.status(200).send({ user });
      })
      .catch((err) => {
        if (!err.message) err.message = "User not found";
        next(err);
      });
  } else {
    res.status(403).send({ message: "Invalid user" });
  }
};

exports.loginUser = (req, res, next) => {
  const { username, password } = req.body;

  checkUserCredentials(username)
    .then(async (user) => {
      const passwordOk = await comparePasswords(password, user.password);
      if (user && passwordOk) {
        const token = jwt.sign(
          { user: user.username, iat: Date.now() },
          process.env.JWT_SECRET
        );
        res.status(200).send({ token });
      } else {
        res.status(401).send({ message: "invalid username or password" });
      }
    })
    .catch(() => {
      res.status(401).send({ message: "invalid username or password" });
    });
};

exports.authoriseUser = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) res.status(401).send({ message: "Unauthorised" });
  else {
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: "Unauthorised" });
      } else {
        req.user = decoded.user;
        next();
      }
    });
  }
};
