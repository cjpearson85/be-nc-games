const categoriesRouter = require("./categories.router");
const reviewsRouter = require("./reviews.router");
const apiRouter = require("express").Router();
const commentsRouter = require("./comments.router");

const endpoints = require("../endpoints.json");

apiRouter.get("/", (req, res, next) => {
  res.status(200).send({ endpoints });
});

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
