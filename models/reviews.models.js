const format = require("pg-format");
const db = require("../db/connection.js");
const { insertToTable } = require("../db/utils/sql-queries.js");
const { getSingleResult } = require("../helper-functions.js");

exports.selectReviews = async ({
  sort_by,
  order,
  category,
  title,
  owner,
  created_at,
  limit,
  p,
}) => {
  const validSortBy = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  const { rows: categories } = await db.query(`SELECT slug FROM categories;`);

  if (
    !categories.map((row) => row.slug).includes(category) &&
    category !== undefined
  ) {
    return Promise.reject({ status: 404, message: "Category not found" });
  } 

  let queryValues = [];
  let queryStr = `
    SELECT owner, title, reviews.review_id, category,review_img_url, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id`;

  let queryCount = 1;

  if (category) {
    queryStr += ` WHERE category = $${queryCount}`;
    queryValues.push(category);
    queryCount++;
  } 
  
  if (title) {
    const titleInsert = `%${title}%`;
    if (queryCount === 1) {
      queryStr += ` WHERE title ILIKE $${queryCount}`;
    } else {
      queryStr += ` AND title ILIKE $${queryCount}`;
    }
    queryValues.push(titleInsert);
    queryCount++;
  }

  if (owner) {
    if (queryCount === 1) {
      queryStr += ` WHERE owner = $${queryCount}`;
    } else {
      queryStr += ` AND owner = $${queryCount}`;
    }
    queryValues.push(owner);
    queryCount++;
  }

  if (created_at) {
    let compareTime = new Date(Date.now() - created_at);

    if (queryCount === 1) {
      queryStr += ` WHERE reviews.created_at > $${queryCount}`;
    } else {
      queryStr += ` AND reviews.created_at > $${queryCount}`;
    }
    queryValues.push(compareTime);
    queryCount++;
  }

  queryStr += ` 
    GROUP BY reviews.review_id
    ORDER BY ${sort_by} ${order}, review_id DESC `;

  const { rowCount } = await db.query(queryStr, queryValues);

  queryStr += `LIMIT $${queryCount} `;

  queryValues.push(limit);
  queryCount++;

  queryStr += `OFFSET $${queryCount};`;

  const offset = (p - 1) * limit;
  queryValues.push(offset);

  // console.log(queryStr);
  // console.log(queryValues);

  const { rows } = await db.query(queryStr, queryValues);

  return { rows, rowCount };
};

exports.insertReview = async (body) => {
  const columns = Object.keys(body);
  const values = Object.values(body);

  if (values.some((el) => el === undefined)) {
    return Promise.reject({ status: 400, message: "Missing required fields" });
  }

  let queryStr = insertToTable("reviews", columns, [values]);
  queryStr += `RETURNING review_id`;

  const { review_id } = await getSingleResult(queryStr);

  return this.selectReviewById(review_id);
};

exports.selectReviewById = async (review_id) => {
  let queryStr = `
    SELECT owner, title, reviews.review_id, review_body, designer, review_img_url, category, reviews.created_at, reviews.votes, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;
    `;
  return getSingleResult(queryStr, [review_id]);
};

exports.updateReviewById = async (review_id, body) => {
  let pairs = Object.entries(body).filter((pair) => {
    const [, value] = pair;
    return value;
  });
  
  if (Object.is(parseInt(review_id), NaN)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  } else if (pairs.length < 1) {
    return Promise.reject({ status: 400, message: "Missing required fields" });
  }

  let queryStr = `
    UPDATE reviews 
    SET `;

  pairs.forEach((pair) => {
    const [key, value] = pair;
    if (key === 'votes') {
      const newVotes = `${key} + ${value}`
      queryStr += format(`votes = %s, `, newVotes);
    } else {
      queryStr += format(`%I = %L, `, key, value);
    }
  });

  queryStr = queryStr.slice(0, -2);
  queryStr += `
    WHERE review_id = $1
    RETURNING *;
  `;

  return getSingleResult(queryStr, [review_id]);
};

exports.removeReviewById = async (review_id) => {
  if (Object.is(parseInt(review_id), NaN)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  return getSingleResult(
    `
    DELETE FROM reviews
    WHERE review_id = $1
    RETURNING review_id;`,
    [review_id]
  );
};
