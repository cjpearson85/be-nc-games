const {
  getCategories,
  postCategory,
} = require("../controllers/categories.controllers");
const { authoriseUser } = require("../controllers/users.controllers");

const categoriesRouter = require("express").Router();

categoriesRouter.get("/", getCategories);

categoriesRouter.use(authoriseUser);

categoriesRouter.post("/", postCategory);

module.exports = categoriesRouter;
