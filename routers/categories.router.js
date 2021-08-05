const {
  getCategories,
  postCategory,
} = require("../controllers/categories.controllers");

const categoriesRouter = require("express").Router();

categoriesRouter
    .route("/")
    .get(getCategories)
    .post(postCategory);

module.exports = categoriesRouter;
