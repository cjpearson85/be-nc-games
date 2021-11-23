const db = require("../db/connection.js");
const jwt = require("jsonwebtoken");
const app = require("../app.js");
const defaults = require("superagent-defaults");
const request = defaults(require("supertest")(app));
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");

beforeEach(async () => {
  await seed(testData);
  const {
    body: { token },
  } = await request
    .post("/api/login")
    .send({ username: "philippaclaire9", password: "secure123" });
  request.set("Authorization", `BEARER ${token}`);
});

afterAll(() => db.end());

// const setUser = (username) => {
//   const token = jwt.sign(
//     { user: username, iat: Date.now() },
//     process.env.JWT_SECRET
//   );
// request.set("Authorization", `BEARER ${token}`);
//   return ["Authorization", `BEARER ${token}`];
// };

describe("GET - /api", () => {
  test("should return a json representation of all the available endpoints of the api", async () => {
    const {
      body: { endpoints },
    } = await request.get("/api").expect(200);
    expect(endpoints).toHaveProperty("GET /api/categories");
    expect(endpoints).toHaveProperty("GET /api/reviews");
  });
});

describe("GET - /api/invalidpath", () => {
  test("should return a 404 with a custom message if a request is made to an invalid path", async () => {
    const {
      body: { message },
    } = await request.get("/api/invalidpath").expect(404);

    expect(message).toBe("Invalid path");
  });
});

describe("/login", () => {
  test("POST responds with an access token given correct username and password", async () => {
    const { body } = await request
      .post("/api/login")
      .set("Authorization", "")
      .send({ username: "mallionaire", password: "secure123" })
      .expect(200);

    expect(body).toHaveProperty("token");
  });
  test("POST responds with status 401 for an incorrect password", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/login")
      .set("Authorization", "")
      .send({ username: "mallionaire", password: "wrong-password" })
      .expect(401);

    expect(message).toEqual("invalid username or password");
  });
  test("POST responds with status 401 for an incorrect username", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/login")
      .set("Authorization", "")
      .send({ username: "paul", password: "secure123" })
      .expect(401);

    expect(message).toEqual("invalid username or password");
  });
});

describe("GET - /api/categories", () => {
  test('should return an array of category objects on a key of "categories", sorted in ascending alphabetical order by slug by default', async () => {
    const {
      body: { categories },
    } = await request.get("/api/categories").expect(200);

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
  test("should not require an authorised user to get the data", async () => {
    const { body } = await request
      .get("/api/categories")
      .set("Authorization", "")
      .expect(200);

    expect(body).toHaveProperty("categories");
  });
});

describe("POST - /api/categories", () => {
  test("should add a new category to the categories table and return the newly created category object", async () => {
    const {
      body: { category },
    } = await request
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
    } = await request
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
    } = await request
      .post("/api/categories")
      .send({
        slug: "dexterity",
        description: "test_description",
      })
      .expect(400);

    expect(message).toBe("Unique field already exists");
  });
  test("should return a 401 status code and custom message when an unauthorised user tries to post new category", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/categories")
      .set("Authorization", "")
      .send({
        slug: "dexterity",
        description: "test_description",
      })
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});

describe("GET - /api/users", () => {
  test("should return an array of user objects on a key of users, sorted in ascending alphabetical order by username by default", async () => {
    const {
      body: { users },
    } = await request.get("/api/users").expect(200);

    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(4);
    users.forEach((user) => {
      expect(user).toMatchObject({
        username: expect.any(String),
        total_likes: expect.any(Number),
        avatar_url: expect.any(String),
        name: expect.any(String),
      });
    });
    expect(users).toBeSortedBy("username", { ascending: true });
  });
  test("should return an array of user objects on a key of users, sorted in descending order by total likes", async () => {
    const {
      body: { users },
    } = await request
      .get("/api/users?sort_by=total_likes&order=desc")
      .expect(200);

    expect(users).toBeSortedBy("total_likes", { descending: true });
  });
  test("should not require an authorised user to get the data", async () => {
    const { body } = await request
      .get("/api/users")
      .set("Authorization", "")
      .expect(200);

    expect(body).toHaveProperty("users");
  });
});

describe("POST - /api/register", () => {
  test("should add a new user to the database and return the newly created user object ", async () => {
    const {
      body: { user },
    } = await request
      .post("/api/register")
      .send({
        username: "test_username",
        avatar_url: "https://fakeurl.com/test.png",
        name: "John Doe",
        password: "secure123",
      })
      .expect(201);

    expect(user).toMatchObject({
      username: "test_username",
      avatar_url: "https://fakeurl.com/test.png",
      name: "John Doe",
    });

    const { rowCount } = await db.query(`SELECT * FROM users`);
    expect(rowCount).toBe(5);
  });
  test("should return a 400 and message if provided username already exists", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/register")
      .send({
        username: "philippaclaire9",
        avatar_url: "https://fakeurl.com/test.png",
        name: "John Doe",
        password: "secure123",
      })
      .expect(400);

    expect(message).toBe("Unique field already exists");
  });
  test("should ignore any additional fields beyond the specified ones", async () => {
    const {
      body: { user },
    } = await request
      .post("/api/register")
      .send({
        username: "test_username",
        avatar_url: "https://fakeurl.com/test.png",
        name: "John Doe",
        password: "secure123",
        address: "123 Fake Street",
      })
      .expect(201);

    expect(user).toMatchObject({
      username: "test_username",
      avatar_url: "https://fakeurl.com/test.png",
      name: "John Doe",
    });
    expect(user).toEqual(
      expect.not.objectContaining({
        username: "test_username",
        avatar_url: "https://fakeurl.com/test.png",
        name: "John Doe",
        address: "123 Fake Street",
      })
    );
  });
  test("should return a 400 status code and message if missing any required input fields", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/register")
      .send({
        avatar_url: "https://fakeurl.com/test.png",
        name: "John Doe",
      })
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
});

describe("GET - /api/users/:username", () => {
  test("should return a user object matching the associated username", async () => {
    const {
      body: { user },
    } = await request.get("/api/users/philippaclaire9").expect(200);

    const output = {
      username: "philippaclaire9",
      total_likes: "25",
      avatar_url: "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
      name: "philippa",
    };

    expect(user).toEqual(output);
  });
  test("should return a 404 if an passed a valid username that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request.get("/api/users/dog").expect(404);

    expect(message).toBe("User not found");
  });
  test("should not require an authorised user to get the data", async () => {
    const { body } = await request
      .get("/api/users/philippaclaire9")
      .set("Authorization", "")
      .expect(200);

    expect(body).toHaveProperty("user");
  });
});

describe("PATCH - /api/users/:username", () => {
  test("should update the specified fields and return the amended user object", async () => {
    const {
      body: { user },
    } = await request
      .patch("/api/users/philippaclaire9")
      .send({
        avatar_url: "https://fakeurl.com/test.png",
        name: "John Doe",
      })
      .expect(200);

    expect(user).toMatchObject({
      username: "philippaclaire9",
      avatar_url: "https://fakeurl.com/test.png",
      name: "John Doe",
    });
  });
  test("should not alter any fields not included in request body", async () => {
    const {
      body: { user },
    } = await request
      .patch("/api/users/philippaclaire9")
      .send({
        avatar_url: "https://fakeurl.com/test.png",
      })
      .expect(200);

    expect(user).toMatchObject({
      username: "philippaclaire9",
      avatar_url: "https://fakeurl.com/test.png",
      name: "philippa",
    });
  });
  test("should return 400 if given no valid fields to update", async () => {
    const {
      body: { message },
    } = await request.patch("/api/users/philippaclaire9").send({}).expect(400);

    expect(message).toBe("Missing required fields");
  });
  // test("should return a 404 if an passed a valid username that doesn't exist in the database", async () => {
  //   const {
  //     body: { message },
  //   } = await request
  //     .patch("/api/users/dog")
  //     .send({
  //       avatar_url: "https://fakeurl.com/test.png",
  //     })
  //     .expect(404);

  //   expect(message).toBe("User not found");
  // });
  test("should return a 401 status code and custom message when an unauthorised user tries to edit user details", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/users/philippaclaire9")
      .set("Authorization", "")
      .send({
        avatar_url: "https://fakeurl.com/test.png",
      })
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});

describe("GET - /api/reviews", () => {
  test("should return an array of review objects, ordered by date descending by default", async () => {
    const {
      body: { reviews, total_count },
    } = await request.get("/api/reviews").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(total_count).toBe(13);
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
    } = await request
      .get("/api/reviews?sort_by=review_id&order=asc")
      .expect(200);

    expect(reviews).toBeSortedBy("review_id", { ascending: true });
  });
  test("should return an array of review objects, filtered by the specified category", async () => {
    const {
      body: { reviews },
    } = await request.get("/api/reviews?category=dexterity").expect(200);

    expect(reviews).toHaveLength(1);
    expect(reviews[0].review_id).toBe(2);
  });
  test("should return an array of review objects, filtered by the specified owner", async () => {
    const {
      body: { total_count },
    } = await request.get("/api/reviews?owner=mallionaire").expect(200);

    expect(total_count).toBe(11);
  });
  test("should return an empty array if given a category that is in the db but has no associated reviews", async () => {
    const {
      body: { reviews },
    } = await request
      .get("/api/reviews?category=children's%20games")
      .expect(200);

    expect(reviews).toHaveLength(0);
  });
  test("should return an array of review objects, filtered by the specified title", async () => {
    const {
      body: { reviews },
    } = await request
      .get(
        "/api/reviews?title=werewolf&category=social deduction&sort_by=review_id"
      )
      .expect(200);

    expect(reviews).toHaveLength(2);
    expect(reviews[0].review_id).toBe(8);
    expect(reviews[1].review_id).toBe(3);
  });
  test('should return 400 status code and a message of "bad request" if provided an invalid column to sort by', async () => {
    const {
      body: { message },
    } = await request.get("/api/reviews?sort_by=dexterity").expect(400);

    expect(message).toBe("bad request");
  });
  test('should return 400 status code and a message of "bad request" if provided an invalid order query', async () => {
    const {
      body: { message },
    } = await request.get("/api/reviews?order=dexterity").expect(400);

    expect(message).toBe("bad request");
  });
  test("should return 404 if provided an category that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request.get("/api/reviews?category=chance").expect(404);

    expect(message).toBe("Category not found");
  });
  test("should return the first ten rows when passed no additional queries", async () => {
    const {
      body: { reviews },
    } = await request.get("/api/reviews").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews).toHaveLength(10);
    expect(reviews[0].review_id).toBe(7);
    expect(reviews[9].review_id).toBe(1);
  });
  test("should return the second five rows when passed additional queries", async () => {
    const {
      body: { reviews },
    } = await request.get("/api/reviews?limit=5&p=2").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews).toHaveLength(5);
    expect(reviews[0].review_id).toBe(9);
    expect(reviews[4].review_id).toBe(1);
  });
  test("should return an array of reviews by the limit and a total_count displaying the number of result discounting the limit", async () => {
    const {
      body: { total_count, reviews },
    } = await request.get("/api/reviews?limit=5").expect(200);

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews).toHaveLength(5);
    expect(total_count).toBe(13);
  });
  test("should return all the reviews created in the last 10 minutes", async () => {
    await request.post("/api/reviews").send({
      owner: "philippaclaire9",
      title: "test_title",
      review_img_url:
        "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      review_body: "test_body",
      designer: "Gamey McGameface",
      category: "dexterity",
      created_at: new Date(Date.now() - 540000),
    });

    const {
      body: { reviews, total_count },
    } = await request.get("/api/reviews?created_at=600000").expect(200);

    expect(total_count).toBe(1);
    expect(reviews[0].review_id).toBe(14);
  });
  test("should not require an authorised user to get the data", async () => {
    const { body } = await request
      .get("/api/reviews")
      .set("Authorization", "")
      .expect(200);

    expect(body).toHaveProperty("reviews");
  });
});

describe("POST - /api/reviews", () => {
  test("should add a new review to the database and return the newly created review object", async () => {
    const {
      body: { review },
    } = await request
      .post("/api/reviews")
      .send({
        title: "test_title",
        review_img_url:
          "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "dexterity",
      })
      .expect(201);

    expect(review).toMatchObject({
      review_id: 14,
      owner: "philippaclaire9",
      title: "test_title",
      review_img_url:
        "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
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
    } = await request
      .post("/api/reviews")
      .send({
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "dexterity",
      })
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
  // test("should return a 404 status code and message if owner not in the db", async () => {
  //   const {
  //     body: { message },
  //   } = await request
  //     .post("/api/reviews")
  //     .send({
  //       title: "test_title",
  //       review_img_url:
  //         "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  //       review_body: "test_body",
  //       designer: "Gamey McGameface",
  //       category: "dexterity",
  //     })
  //     .expect(404);

  //   expect(message).toBe("Insert or update violates foreign key constraint");
  // });
  test("should return a 404 status code and message if category not in the db", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/reviews")
      .send({
        title: "test_title",
        review_img_url:
          "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "deck-building",
      })
      .expect(404);

    expect(message).toBe("Insert or update violates foreign key constraint");
  });
  test("should return a 401 status code and custom message when an unauthorised user tries to post a review", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/reviews")
      .set("Authorization", "")
      .send({
        title: "test_title",
        review_img_url:
          "https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        review_body: "test_body",
        designer: "Gamey McGameface",
        category: "dexterity",
      })
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});

describe("GET - /api/reviews/:review_id", () => {
  test("should return a review object matching the review_id", async () => {
    const {
      body: { review },
    } = await request.get("/api/reviews/2").expect(200);

    const output = {
      owner: "philippaclaire9",
      avatar_url: "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
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
    } = await request.get("/api/reviews/not_an_id").expect(400);

    expect(message).toBe("Invalid datatype");
  });
  test("should return a 404 if an passed a valid review_id that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request.get("/api/reviews/100").expect(404);

    expect(message).toBe("Review not found");
  });
  test("should not require an authorised user to get the data", async () => {
    const { body } = await request
      .get("/api/reviews/2")
      .set("Authorization", "")
      .expect(200);

    expect(body).toHaveProperty("review");
  });
});

describe("PATCH - /api/reviews/:review_id", () => {
  test("should update the votes field by the specified amount and return the amended review", async () => {
    const {
      body: { review },
    } = await request
      .patch("/api/reviews/12")
      .send({ inc_votes: 20 })
      .expect(200);

    expect(review.votes).toBe(120);
  });
  test("should update the votes field by the specified amount and return the amended review--should work with negative values too", async () => {
    const {
      body: { review },
    } = await request
      .patch("/api/reviews/12")
      .send({ inc_votes: -20 })
      .expect(200);

    expect(review.votes).toBe(80);
  });
  test("users should not be able to vote on their own reviews", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/reviews/2")
      .send({ inc_votes: 20 })
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
  test("should update the review body if passed the relevant field", async () => {
    const {
      body: { review },
    } = await request
      .patch("/api/reviews/2")
      .send({ review_body: "Test" })
      .expect(200);

    expect(review.review_body).toBe("Test");
  });
  test("only the owner of the review should be able to edit fields other than votes", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/reviews/12")
      .send({ review_body: "Test" })
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
  // test("should still work when updating multiple fields at once", async () => {
  //   const {
  //     body: { review },
  //   } = await request
  //     .patch("/api/reviews/12")
  //     .send({ inc_votes: 20, review_body: "Test" })
  //     .expect(200);

  //   expect(review.votes).toBe(120);
  //   expect(review.review_body).toBe("Test");
  // });
  test("should return a 400 and custom message when a required input field is missing", async () => {
    const {
      body: { message },
    } = await request.patch("/api/reviews/12").send({}).expect(400);

    expect(message).toBe("Missing required fields");
  });
  test("should return a 400 and custom message when input field is of the incorrect datatype", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/reviews/12")
      .send({ inc_votes: "twenty" })
      .expect(400);

    expect(message).toBe("Invalid datatype");
  });
  test("should return a 404 if an passed a valid review_id that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/reviews/15")
      .send({ inc_votes: 20 })
      .expect(404);

    expect(message).toBe("Review not found");
  });
  test("should return a 400 and custom message when passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/reviews/seven")
      .send({ inc_votes: 1 })
      .expect(400);

    expect(message).toBe("Bad request");
  });
  test("should return a 401 status code and custom message when an unauthorised user tries to edit a review", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/reviews")
      .set("Authorization", "")
      .send({ inc_votes: 20 })
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});

describe("DELETE - /api/reviews/:review_id", () => {
  // request.set(...setUser("philippaclaire9"));
  test("should remove the specified review and all associated comments from the database", () => {
    return request
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
    } = await request.delete("/api/reviews/seven").expect(400);

    expect(message).toBe("Bad request");
  });
  test("should return a 404 and a custom message when trying to delete a review that doesn't exist", async () => {
    const {
      body: { message },
    } = await request.delete("/api/reviews/15").expect(404);

    expect(message).toBe("Review not found");
  });
  test("should return a 401 status code and custom message when an unauthorised user tries to delete a review", async () => {
    const {
      body: { message },
    } = await request
      .delete("/api/reviews/15")
      .set("Authorization", "")
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});

describe("GET - /api/reviews/:review_id/comments", () => {
  test("should return an array of all the comments for a specific review, ordered by date descending by default", async () => {
    const {
      body: { comments },
    } = await request.get("/api/reviews/2/comments").expect(200);

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
    } = await request
      .get("/api/reviews/2/comments?sort_by=votes&order=asc")
      .expect(200);

    expect(comments).toBeSortedBy("votes", { ascending: true });
  });
  test("should return only the number of comments specified by the limit", async () => {
    const {
      body: { total_count, comments },
    } = await request.get("/api/reviews/2/comments?limit=1&p=2").expect(200);

    expect(Array.isArray(comments)).toBe(true);
    expect(comments).toHaveLength(1);
    expect(comments[0].comment_id).toBe(1);
    expect(total_count).toBe(3);
  });
  test("should return an empty array when given a valid review_id that doesn't have any associated comments", async () => {
    const {
      body: { comments },
    } = await request.get("/api/reviews/7/comments").expect(200);

    expect(comments).toHaveLength(0);
  });
  test("should return a 404 and a custom message when trying to access the comments of a review that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request.get("/api/reviews/15/comments").expect(404);

    expect(message).toBe("Review not found");
  });
  test("should return a 400 and custom message when passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request.get("/api/reviews/seven/comments").expect(400);

    expect(message).toBe("Bad request");
  });
  test("should not require an authorised user to get the data", async () => {
    const { body } = await request
      .get("/api/reviews/7/comments")
      .set("Authorization", "")
      .expect(200);

    expect(body).toHaveProperty("comments");
  });
});

describe("POST - /api/reviews/:review_id/comments", () => {
  test("should insert a new comment into the comments table and return the created comment object", async () => {
    const {
      body: { comment },
    } = await request
      .post("/api/reviews/2/comments")
      .send({
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
    } = await request
      .post("/api/reviews/2/comments")
      .send({
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
  // test("should return a 400 and custom message when an unregistered user tries to comment", async () => {
  //   const {
  //     body: { message },
  //   } = await request
  //     .post("/api/reviews/2/comments")
  //     .send({
  //       author: "test_user",
  //       body: "test_body",
  //     })
  //     .expect(404);

  //   expect(message).toBe("Insert or update violates foreign key constraint");
  // });
  test("should return a 400 and custom message when a required input field is missing", async () => {
    const {
      body: { message },
    } = await request.post("/api/reviews/2/comments").send({}).expect(400);

    expect(message).toBe("Missing required fields");
  });
  test("should return a 404 and a custom message when trying to post a comment to a review that doesn't exist in the database", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/reviews/15/comments")
      .send({
        body: "test body",
      })
      .expect(404);

    expect(message).toBe("Insert or update violates foreign key constraint");
  });
  test("should return a 400 and custom message when passed an invalid review_id", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/reviews/seven/comments")
      .send({
        body: "test body",
      })
      .expect(400);

    expect(message).toBe("Bad request");
  });
  test("should return a 401 status code and custom message when an unauthorised user tries to post a comment", async () => {
    const {
      body: { message },
    } = await request
      .post("/api/reviews/2/comments")
      .set("Authorization", "")
      .send({
        body: "test body",
      })
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});

describe("PATCH - /api/comments/:comment_id", () => {
  test("should update the votes field by the specified amount and return the amended comment", async () => {
    const {
      body: { comment },
    } = await request
      .patch("/api/comments/2")
      .send({ inc_votes: 1 })
      .expect(200);
    expect(comment.votes).toBe(14);
  });
  test("should update the votes field by the specified amount and return the amended comment--should work with negative values too", async () => {
    const {
      body: { comment },
    } = await request
      .patch("/api/comments/2")
      .send({ inc_votes: -1 })
      .expect(200);
    expect(comment.votes).toBe(12);
  });
  test("users should not be able to vote on their own comments", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/comments/6")
      .send({ inc_votes: 1 })
      .expect(400);
    expect(message).toBe("Missing required fields");
  });
  test("should update the comment body if passed the relevant field", async () => {
    const {
      body: { comment },
    } = await request
      .patch("/api/comments/6")
      .send({ body: "Test" })
      .expect(200);

    expect(comment.body).toBe("Test");
  });
  test("only the author of the comment should be able to edit fields other than votes", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/comments/2")
      .send({ body: "Test" })
      .expect(400);

    expect(message).toBe("Missing required fields");
  });
  // test("should update the comment body if passed the relevant field", async () => {
  //   const {
  //     body: { comment },
  //   } = await request
  //     .patch("/api/comments/6")
  //     .send({ body: "Test", inc_votes: -1 })
  //     .expect(200);

  //   expect(comment.body).toBe("Test");
  //   expect(comment.votes).toBe(9);
  // });
  test("should return a 400 and custom message when a required input field is missing", async () => {
    const {
      body: { message },
    } = await request.patch("/api/comments/6").send({}).expect(400);

    expect(message).toBe("Missing required fields");
  });
  test("should return a 400 and custom message when input field is of the incorrect datatype", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/comments/2")
      .send({ inc_votes: "twenty" })
      .expect(400);

    expect(message).toBe("Invalid datatype");
  });
  test("should return a 404 and a custom message when trying to update a comment that doesn't exist", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/comments/7")
      .send({ inc_votes: 1 })
      .expect(404);

    expect(message).toBe("Comment not found");
  });
  test("should return a 400 and custom message when passed an invalid comment_id", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/comments/seven")
      .send({ inc_votes: 1 })
      .expect(400);

    expect(message).toBe("Bad request");
  });
  test("should return a 401 status code and custom message when an unauthorised user tries to edit a comment", async () => {
    const {
      body: { message },
    } = await request
      .patch("/api/comments/6")
      .set("Authorization", "")
      .send({ inc_votes: 1 })
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});

describe("DELETE - /api/comments/:comment_id", () => {
  test("should remove the specified comment from the database", async () => {
    await request.delete("/api/comments/6").expect(204);

    const { rows } = await db.query("SELECT comment_id FROM comments;");
    expect(rows).toHaveLength(5);
  });
  test("should not remove the specified comment from the database if user doesn't match comment author", async () => {
    const {
      body: { message },
    } = await request.delete("/api/comments/5").expect(400);

    expect(message).toBe("Invalid user");
  });
  test("should return a 400 and custom message when passed an invalid comment_id", async () => {
    const {
      body: { message },
    } = await request.delete("/api/comments/seven").expect(400);

    expect(message).toBe("Bad request");
  });
  test("should return a 404 and a custom message when trying to delete a comment that doesn't exist", async () => {
    const {
      body: { message },
    } = await request.delete("/api/comments/7").expect(404);

    expect(message).toBe("Comment not found");
  });
  test("should return a 401 status code and custom message when an unauthorised user tries to delete a comment", async () => {
    const {
      body: { message },
    } = await request
      .delete("/api/comments/6")
      .set("Authorization", "")
      .expect(401);

    expect(message).toBe("Unauthorised");
  });
});
