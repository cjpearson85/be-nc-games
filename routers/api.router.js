const jwt = require("jsonwebtoken");
const categoriesRouter = require("./categories.router");
const reviewsRouter = require("./reviews.router");
const usersRouter = require("./users.router");
const commentsRouter = require("./comments.router");
const apiRouter = require("express").Router();

const endpoints = require("../endpoints.json");
const { checkUserCredentials } = require("../models/users.models");
const { comparePasswords } = require("../helper-functions");

apiRouter.get("/", (req, res, next) => {
  res.status(200).send({ endpoints });
});

apiRouter.post("/login", (req, res, next) => {
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
});

apiRouter.use((req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) res.status(401).send({ message: "Unauthorised" });
  else {
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
      if (err) {
        res.status(401).send({ message: "Unauthorised" });
      } else {
        next();
      }
    });
  }
});

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
