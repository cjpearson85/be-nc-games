const db = require('../connection.js');
const format = require('pg-format');
const { categoriesFormatter, usersFormatter, reviewsFormatter, createRef, commentsFormatter } = require('../utils/data-manipulation.js');

const seed = async data => {
  const { categoryData, commentData, reviewData, userData } = data;
  // DROP TABLES
  await db.query('DROP TABLE IF EXISTS comments');
  await db.query('DROP TABLE IF EXISTS reviews');
  await db.query('DROP TABLE IF EXISTS users');
  await db.query('DROP TABLE IF EXISTS categories');

  // 1. create tables
  await db.query(`
    CREATE TABLE categories (
      slug VARCHAR(100) PRIMARY KEY NOT NULL,
      description TEXT NOT NULL
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

  // 2. insert data
  let categoriesQuery = format(`
  INSERT INTO categories
  (slug, description)
  VALUES
  %L;
`, categoriesFormatter(categoryData));

  await db.query(categoriesQuery);

  const usersQuery = format(`
  INSERT INTO users
  (username, avatar_url, name)
  VALUES
  %L;
  `, usersFormatter(userData));

  await db.query(usersQuery);

  const reviewsQuery = format(`
  INSERT INTO reviews
  (title, review_body, designer, review_img_url, votes, category, owner, created_at)
  VALUES
  %L
  RETURNING *;
  `, reviewsFormatter(reviewData));

  const { rows } = await db.query(reviewsQuery);

  const reviewRefObj = createRef(rows, 'title', 'review_id');

  const commentsQuery = format(`
  INSERT INTO comments
  (author, review_id, votes, created_at, body)
  VALUES
  %L
  RETURNING *;
  `, commentsFormatter(commentData, reviewRefObj));

  await db.query(commentsQuery);
};

module.exports = seed;
