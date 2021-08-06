const db = require("../db/connection.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET - /api", () => {
  test("should return a json representation of all the available endpoints of the api", async () => {
    const {
      body: { endpoints },
    } = await request(app).get("/api").expect(200);
    expect(endpoints).toHaveProperty("GET /api/categories");
    expect(endpoints).toHaveProperty("GET /api/reviews");
  });
});

describe("GET - /api/invalidpath", () => {
  test("should return a 404 with a custom message if a request is made to an invalid path", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/invalidpath").expect(404);

    expect(message).toBe("Invalid path");
  });
});

describe("GET - /api/categories", () => {
  test('should return an array of category objects on a key of "categories", sorted in ascending alphabetical order by slug by default', async () => {
    const {
      body: { categories },
    } = await request(app).get("/api/categories").expect(200);

    expect(Array.isArray(categories)).toBe(true);
    expect(categories).toHaveLength(4);

    categories.forEach((category) => {
      expect(category).toMatchObject({
        slug: expect.any(String),
        description: expect.any(String),
      });
    });
    expect(categories).toBeSortedBy("slug", { ascending: true });
  });
});

describe("POST - /api/categories", () => {
  test("should add a new category to the categories table and return the newly created category object", async () => {
    const {
      body: { category },
    } = await request(app)
      .post("/api/categories")
      .send({
        slug: "test_slug",
        description: "test_description",
      })
      .expect(201);

    expect(category).toEqual({
      slug: "test_slug",
      description: "test_description",
    });

    const { rowCount } = await db.query(`SELECT * FROM categories`);
    expect(rowCount).toBe(5);
  });
  test("should return a 400 status code and custom message when no slug on request body", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/categories")
      .send({
        description: "test_description",
      })
      .expect(400);

    expect(message).toBe("No slug on POST body");
  });
  test("should return a 400 status code and custom message when slug already exists in db", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/categories")
      .send({
        slug: "dexterity",
        description: "test_description",
      })
      .expect(400);

    expect(message).toBe("Duplicate key value violates unique constraint");
  });
});

describe("GET - /api/users", () => {
  test("should return an array of user objects on a key of users, sorted in ascending alphabetical order by username by default", async () => {
    const {
      body: { users },
    } = await request(app).get("/api/users").expect(200);

    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(4);
    users.forEach((user) => {
      expect(user).toMatchObject({
        username: expect.any(String),
        avatar_url: expect.any(String),
        name: expect.any(String),
      });
    });
    expect(users).toBeSortedBy("username", { ascending: true });
  });
});

describe("GET - /api/users/:username", () => {
  test("should return a user object matching the associated username", async () => {
    const {
      body: { user },
    } = await request(app).get("/api/users/philippaclaire9").expect(200);

    const output = {
      username: "philippaclaire9",
      avatar_url: "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
      name: "philippa",
    };

    expect(user).toEqual(output);
  });
  test("should return a 404 if an passed a valid username that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/users/dog").expect(404);

    expect(message).toBe("User not found");
  });
});

describe("GET - /api/reviews", () => {
  test("should return an array of review objects, ordered by date descending by default", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews?limit=15").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews).toHaveLength(13);
    reviews.forEach((review) => {
      expect(review).toMatchObject({
        owner: expect.any(String),
        title: expect.any(String),
        review_id: expect.any(Number),
        category: expect.any(String),
        review_img_url: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        comment_count: expect.any(String),
      });
    });
    expect(reviews).toBeSortedBy("created_at", { descending: true });
  });
  test("should return an array of review objects, ordered by the specified parameters", async () => {
    const {
      body: { reviews },
    } = await request(app)
      .get("/api/reviews?sort_by=review_id&order=asc")
      .expect(200);

    expect(reviews).toBeSortedBy("review_id", { ascending: true });
  });
  test("should return an array of review objects, filtered by the specified category", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews?category=dexterity").expect(200);

    expect(reviews).toHaveLength(1);
    expect(reviews[0].review_id).toBe(2);
  });
  test('should return 400 status code and a message of "bad request" if provided an invalid column to sort by', async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews?sort_by=dexterity").expect(400);

    expect(message).toBe("bad request");
  });
  test('should return 400 status code and a message of "bad request" if provided an invalid order query', async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews?order=dexterity").expect(400);

    expect(message).toBe("bad request");
  });
  test("should return 404 if provided an category that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews?category=chance").expect(404);

    expect(message).toBe("Category not found");
  });
  test("should return the first ten rows when passed no additional queries", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews).toHaveLength(10);
    expect(reviews[0].review_id).toBe(7);
    expect(reviews[9].review_id).toBe(1);
  });
  test("should return the second five rows when passed additional queries", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews?limit=5&p=2").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews).toHaveLength(5);
    expect(reviews[0].review_id).toBe(10);
    expect(reviews[4].review_id).toBe(1);
  });
  test("should return an array of reviews by the limit and a total_count displaying the number of result discounting the limit", async () => {
    const {
      body: { total_count, reviews },
    } = await request(app).get("/api/reviews?limit=5").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews).toHaveLength(5);
    expect(total_count).toBe(13);
  });
});

describe("POST - /api/reviews", () => {
  test("should add a new review to the database and return the newly created review object", async () => {
    const {
      body: { review },
    } = await request(app)
      .post("/api/reviews")
      .send({
        owner: "dav3rid",
        title: "test_title",
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "dexterity",
      })
      .expect(201);

    expect(review).toMatchObject({
      review_id: 14,
      owner: "dav3rid",
      title: "test_title",
      review_body: "test_body",
      designer: "Gamey McGameface",
      category: "dexterity",
      votes: 0,
      created_at: expect.any(String),
      comment_count: "0",
    });

    const { rowCount } = await db.query(`SELECT * FROM reviews`);
    expect(rowCount).toBe(14);
  });
  test("should return a 400 status code and message if missing any required input fields", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews")
      .send({
        owner: "dav3rid",
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "dexterity",
      })
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
  test("should return a 404 status code and message if owner not in the db", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews")
      .send({
        owner: "david",
        title: "test_title",
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "dexterity",
      })
      .expect(404);

    expect(message).toBe("Insert or update violates foreign key constraint");
  });
  test("should return a 404 status code and message if category not in the db", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews")
      .send({
        owner: "dav3rid",
        title: "test_title",
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "deck-building",
      })
      .expect(404);

    expect(message).toBe("Insert or update violates foreign key constraint");
  });
});

describe("GET - /api/reviews/:review_id", () => {
  test("should return a review object matching the review_id", async () => {
    const {
      body: { review },
    } = await request(app).get("/api/reviews/2").expect(200);

    const output = {
      owner: "philippaclaire9",
      title: "Jenga",
      review_id: 2,
      review_body: "Fiddly fun for all the family",
      designer: "Leslie Scott",
      review_img_url:
        "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
      category: "dexterity",
      created_at: "2021-01-18T10:01:41.251Z",
      votes: 5,
      comment_count: "3",
    };
    expect(review).toEqual(output);
  });
  test("should return a 400 if an passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews/not_an_id").expect(400);

    expect(message).toBe("Invalid datatype");
  });
  test("should return a 404 if an passed a valid review_id that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews/100").expect(404);

    expect(message).toBe("Review not found");
  });
});

describe("PATCH - /api/reviews/:review_id", () => {
  test("should update the votes field by the specified amount and return the amended review", async () => {
    const {
      body: { review },
    } = await request(app)
      .patch("/api/reviews/12")
      .send({ inc_votes: -20 })
      .expect(200);

    expect(review.votes).toBe(80);
  });
  test("should return a 404 if an passed a valid review_id that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app)
      .patch("/api/reviews/15")
      .send({ inc_votes: 20 })
      .expect(404);

    expect(message).toBe("Review does not exist");
  });
});

describe("DELETE - /api/reviews/:review_id", () => {
  test("should remove the specified review and all associated comments from the database", () => {
    return request(app)
      .delete("/api/reviews/2")
      .expect(204)
      .then(() => {
        return db.query("SELECT review_id FROM reviews;");
      })
      .then(({ rows }) => {
        expect(rows).toHaveLength(12);
        return db.query("SELECT * FROM reviews WHERE review_id = 2;");
      })
      .then(({ rows }) => {
        expect(rows).toHaveLength(0);
      });
  });
  test("should return a 400 and custom message when passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request(app)
      .delete("/api/reviews/seven")
      .expect(400);

    expect(message).toBe("Bad request");
  });
  test("should return a 404 and a custom message when trying to delete a review that doesn't exist", async () => {
    const {
      body: { message },
    } = await request(app)
      .delete("/api/reviews/15")
      .expect(404);

    expect(message).toBe("Review does not exist");
  });

});

describe("GET - /api/reviews/:review_id/comments", () => {
  test("should return an array of all the comments for a specific review, ordered by date descending by default", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/reviews/2/comments").expect(200);

    expect(Array.isArray(comments)).toBe(true);
    expect(comments).toHaveLength(3);
    comments.forEach((comment) => {
      expect(comment).toMatchObject({
        comment_id: expect.any(Number),
        votes: expect.any(Number),
        created_at: expect.any(String),
        author: expect.any(String),
        body: expect.any(String),
      });
    });
    expect(comments).toBeSortedBy("created_at", { descending: true });
  });
  test("should return an array of review objects, ordered by the specified parameters", async () => {
    const {
      body: { comments },
    } = await request(app)
      .get("/api/reviews/2/comments?sort_by=votes&order=asc")
      .expect(200);

    expect(comments).toBeSortedBy("votes", { ascending: true });
  });
  test("should return only the number of comments specified by the limit", async () => {
    const {
      body: { total_count, comments },
    } = await request(app)
      .get("/api/reviews/2/comments?limit=1&p=2")
      .expect(200);

    expect(Array.isArray(comments)).toBe(true);
    expect(comments).toHaveLength(1);
    expect(comments[0].comment_id).toBe(1);
    expect(total_count).toBe(3);
  });
  test("should return an empty array when given a valid review_id that doesn't have any associated comments", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/reviews/7/comments").expect(200);

    expect(comments).toHaveLength(0);
  });
  test("should return a 404 and a custom message when trying to access the comments of a review that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews/15/comments").expect(404);

    expect(message).toBe("Review not found");
  });
  test("should return a 400 and custom message when passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews/seven/comments").expect(400);

    expect(message).toBe("Bad request");
  });
});

describe("POST - /api/reviews/:review_id/comments", () => {
  test("should insert a new comment into the comments table and return the created comment object", async () => {
    const {
      body: { comment },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({
        author: "philippaclaire9",
        body: "test body",
      })
      .expect(201);

    expect(comment).toMatchObject({
      comment_id: 7,
      author: "philippaclaire9",
      review_id: 2,
      votes: 0,
      created_at: expect.any(String),
      body: "test body",
    });
  });
  test("should ignore any additional fields as long as the required ones are presnt", async () => {
    const {
      body: { comment },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({
        author: "philippaclaire9",
        body: "test body",
        extra_key: "test",
      })
      .expect(201);

    expect(comment).toMatchObject({
      comment_id: 7,
      author: "philippaclaire9",
      review_id: 2,
      votes: 0,
      created_at: expect.any(String),
      body: "test body",
    });
  });
  test("should return a 400 and custom message when an unregistered user tries to comment", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({
        author: "test_user",
        body: "test_body",
      })
      .expect(404);

    expect(message).toBe("Insert or update violates foreign key constraint");
  });
  test("should return a 400 and custom message when a required input field is missing", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({
        body: "test_body",
      })
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
  test("should return a 404 and a custom message when trying to post a comment to a review that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews/15/comments")
      .send({
        author: "philippaclaire9",
        body: "test body",
      })
      .expect(404);

    expect(message).toBe("Insert or update violates foreign key constraint");
  });
  test("should return a 400 and custom message when passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews/seven/comments")
      .send({
        author: "philippaclaire9",
        body: "test body",
      })
      .expect(400);

    expect(message).toBe("Bad request");
  });
});

describe("PATCH - /api/comments/:comment_id", () => {
  test("should update the specified comment from the database and return the amended comment", async () => {
    const {
      body: { comment },
    } = await request(app)
      .patch("/api/comments/6")
      .send({ inc_votes: 1 })
      .expect(200);
    expect(comment.votes).toBe(11);
  });
  test("should return a 400 and custom message when a required input field is missing", async () => {
    const {
      body: { message },
    } = await request(app)
      .patch("/api/comments/6")
      .send({})
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
  test("should return a 404 and a custom message when trying to update a comment that doesn't exist", async () => {
    const {
      body: { message },
    } = await request(app)
      .patch("/api/comments/7")
      .send({ inc_votes: 1 })
      .expect(404);

    expect(message).toBe("Comment does not exist");
  });
  test("should return a 400 and custom message when passed an invalid comment_id", async () => {
    const {
      body: { message },
    } = await request(app)
      .patch("/api/comments/seven")
      .send({ inc_votes: 1 })
      .expect(400);

    expect(message).toBe("Bad request");
  });
});

describe("DELETE - /api/comments/:comment_id", () => {
  test("should remove the specified comment from the database", () => {
    return request(app)
      .delete("/api/comments/6")
      .expect(204)
      .then(() => {
        return db.query("SELECT comment_id FROM comments;");
      })
      .then(({ rows }) => {
        expect(rows).toHaveLength(5);
      });
  });
  test("should return a 400 and custom message when passed an invalid comment_id", async () => {
    const {
      body: { message },
    } = await request(app)
      .delete("/api/comments/seven")
      .expect(400);

    expect(message).toBe("Bad request");
  });
  test("should return a 404 and a custom message when trying to delete a comment that doesn't exist", async () => {
    const {
      body: { message },
    } = await request(app)
      .delete("/api/comments/7")
      .expect(404);

    expect(message).toBe("Comment does not exist");
  });
});
