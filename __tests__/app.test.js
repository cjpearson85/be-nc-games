const db = require("../db/connection.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

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

describe('GET - /api/reviews/:review_id', () => {
  test('should return a review object matching the review_id', async () => {
    const {body: {review}} = await request(app).get('/api/reviews/2').expect(200);

    const output = {
      owner: 'philippaclaire9',
      title: 'Jenga',
      review_id: 2,
      review_body: 'Fiddly fun for all the family',
      designer: 'Leslie Scott',
      review_img_url:
        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
      category: 'dexterity',
      created_at: '2021-01-18T10:01:41.251Z',
      votes: 5,
      comment_count: '3'
    }
    expect(review).toEqual(output);
  });
  test('should return a 400 if an passed an invalid review_id', async () => {
    const {body: {message}} = await request(app).get('/api/reviews/not_an_id').expect(400);

    expect(message).toBe("Invalid review_id");
  })
  test('should return a 404 if an passed a valid review_id that doesn\'t exist in the database', async () => {
    const {body: {message}} = await request(app).get('/api/reviews/100').expect(404);

    expect(message).toBe("Review does not exist");
  })
});