const db = require("../connection.js");
const {
  createRef,
  commentsFormatter,
  valuesFormatter,
} = require("../utils/data-manipulation.js");
const { insertToTable } = require("../utils/sql-queries.js");

const seed = async (data) => {
  const { categoryData, commentData, reviewData, userData } = data;

  await db.query("DROP TABLE IF EXISTS comments");
  await db.query("DROP TABLE IF EXISTS reviews");
  await db.query("DROP TABLE IF EXISTS users");
  await db.query("DROP TABLE IF EXISTS categories");

  await db.query(`
    CREATE TABLE categories (
      slug VARCHAR(100) PRIMARY KEY NOT NULL,
      description TEXT
    )`);

  await db.query(`
    CREATE TABLE users (
      username VARCHAR(100) PRIMARY KEY NOT NULL,
      avatar_url TEXT,
      name VARCHAR(100)
    )`);

  await db.query(`
    CREATE TABLE reviews (
      review_id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      review_body TEXT NOT NULL,
      designer VARCHAR(100) NOT NULL,
      review_img_url TEXT DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
      votes INT DEFAULT 0,
      category VARCHAR(100) REFERENCES categories(slug),
      owner VARCHAR(100) REFERENCES users(username),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  await db.query(`
    CREATE TABLE comments (
      comment_id SERIAL PRIMARY KEY,
      author VARCHAR(100) REFERENCES users(username) NOT NULL,
      review_id INT REFERENCES reviews(review_id) ON DELETE CASCADE NOT NULL,
      votes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      body TEXT
    )`);

  let table = "categories";
  let columns = ["slug", "description"];
  let values = valuesFormatter(categoryData, columns);

  const categoriesQuery = insertToTable(table, columns, values);

  await db.query(categoriesQuery);

  table = "users";
  columns = ["username", "avatar_url", "name"];
  values = valuesFormatter(userData, columns);

  const usersQuery = insertToTable(table, columns, values);

  await db.query(usersQuery);

  table = "reviews";
  columns = [
    "title",
    "review_body",
    "designer",
    "review_img_url",
    "votes",
    "category",
    "owner",
    "created_at",
  ];
  values = valuesFormatter(reviewData, columns);

  let reviewsQuery = insertToTable(table, columns, values);
  reviewsQuery += " RETURNING *";

  const { rows } = await db.query(reviewsQuery);

  const reviewRefObj = createRef(rows, "title", "review_id");

  table = "comments";
  columns = ['author', 'review_id', 'votes', 'created_at', 'body'];
  values = commentsFormatter(commentData, reviewRefObj);

  const commentsQuery = insertToTable(table, columns, values);

  await db.query(commentsQuery);
};

module.exports = seed;
