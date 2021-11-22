const categoriesRouter = require("./categories.router");
const reviewsRouter = require("./reviews.router");
const usersRouter = require("./users.router");
const commentsRouter = require("./comments.router");
const apiRouter = require("express").Router();

const endpoints = require("../endpoints.json");
const { loginUser, postUser } = require("../controllers/users.controllers");

apiRouter.get("/", (req, res, next) => {
  res.status(200).send({ endpoints });
});

apiRouter.post("/register", postUser);
apiRouter.post("/login", loginUser);

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
