const { selectCategories, insertCategory } = require("../models/categories.models");

exports.getCategories = (req, res, next) => {
  selectCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch(next);
};

exports.postCategory = (req, res, next) => {
  const { body } = req;

  insertCategory(body)
    .then((category) => {
      res.status(201).send({ category });
    })
    .catch(next);
}