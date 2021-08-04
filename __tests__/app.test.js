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

describe("GET - /api/categories", () => {
  test('should return an array of category objects on a key of "categories"', async () => {
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

describe("GET - /api/users", () => {
  test("should return an array of user objects on a key of users", async () => {
    const {
      body: { users },
    } = await request(app).get("/api/users").expect(200);

    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(4);
    users.forEach((user) => {
      expect(user).toHaveProperty("username");
    });
  });
});

describe.only("GET - /api/users/:username", () => {
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
});

describe("GET - /api/reviews", () => {
  test("should return an array of review objects, ordered by date descending by default", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews").expect(200);

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

    expect(message).toBe("Invalid review_id");
  });
  test("should return a 404 if an passed a valid review_id that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews/100").expect(404);

    expect(message).toBe("Review does not exist");
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
  test("should ", async () => {
    const {
      body: { message },
    } = await request(app)
      .patch("/api/reviews/15")
      .send({ inc_votes: 20 })
      .expect(404);

    expect(message).toBe("Review does not exist");
  });
});

describe("GET - /api/reviews/:review_id/comments", () => {
  test("should return an array of all the comments for a specific review", async () => {
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
  });
  test("should return an empty array when given a valid review_id that doesn't have any associated comments", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/reviews/7/comments").expect(200);

    expect(comments).toHaveLength(0);
  });
  test.skip("should return a 404 and a custom message when trying to access the comments of a review that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews/15/comments").expect(404);

    expect(message).toBe("Review not found");
  });
  test("should return a 400 and custom message when passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request(app).get("/api/reviews/seven/comments").expect(400);

    expect(message).toBe("Invalid review_id");
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
  test("should return a 400 and custom message when an unregistered user tries to comment", async () => {
    const {
      body: { message },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({
        author: "loves2spooge",
        body: "test body",
      })
      .expect(400);

    expect(message).toBe("Please register to comment");
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
});
