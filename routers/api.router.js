const jwt = require("jsonwebtoken");
const categoriesRouter = require("./categories.router");
const reviewsRouter = require("./reviews.router");
const usersRouter = require("./users.router");
const commentsRouter = require("./comments.router");
const apiRouter = require("express").Router();
const app = require("express")();

const endpoints = require("../endpoints.json");
const { checkUserCredentials } = require("../models/users.models");

apiRouter.get("/", (req, res, next) => {
  res.status(200).send({ endpoints });
});

apiRouter.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  checkUserCredentials(username)
    .then((user) => {
      if (!user || password !== user.password)
        res.status(401).send({ message: "invalid username or password" });
      else {
        const token = jwt.sign(
          { user: user.username, iat: Date.now() },
          process.env.JWT_SECRET
        );
        res.send({ token });
      }
    })
    .catch(() => {
      res.status(401).send({ message: "invalid username or password" });
    });
});

app.use((req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
    if (err) next({ status: 401, msg: "Unauthorised" });
    else next();
  });
});

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
