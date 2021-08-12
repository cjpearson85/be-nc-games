const {
  valuesFormatter,
  createRef,
  commentsFormatter,
} = require("../db/utils/data-manipulation.js");
const { insertToTable } = require("../db/utils/sql-queries.js");

describe("createRef", () => {
  const people = [
    {
      name: "vel",
      phoneNumber: "01134445566",
      address: "Northcoders, Leeds",
    },
    {
      name: "ant",
      phoneNumber: "01612223344",
      address: "Northcoders, Manchester",
    },
    { name: "mitch", phoneNumber: "07777777777", address: null },
  ];

  test("returns an empty object, when passed an empty array", () => {
    const input = [];
    const actual = createRef(input);
    const expected = {};
    expect(actual).toEqual(expected);
  });
  test("should return a reference object with the value of the second argument as keys and the value of the third argument as values", () => {
    const songs = [
      {
        track: "11:11",
        artist: "Dinosaur Pile-Up",
        releaseYear: 2015,
        album: "Eleven Eleven",
      },
      {
        track: "Powder Blue",
        artist: "Elbow",
        releaseYear: 2001,
        album: "Asleep In The Back",
      },
    ];
    expect(createRef(people, "name", "phoneNumber")).toEqual({
      vel: "01134445566",
      ant: "01612223344",
      mitch: "07777777777",
    });
    expect(createRef(people, "name", "address")).toEqual({
      vel: "Northcoders, Leeds",
      ant: "Northcoders, Manchester",
      mitch: null,
    });
    expect(createRef(songs, "track", "artist")).toEqual({
      "11:11": "Dinosaur Pile-Up",
      "Powder Blue": "Elbow",
    });
  });
  test("should not mutate the original array", () => {
    const copy = [
      {
        name: "vel",
        phoneNumber: "01134445566",
        address: "Northcoders, Leeds",
      },
      {
        name: "ant",
        phoneNumber: "01612223344",
        address: "Northcoders, Manchester",
      },
      { name: "mitch", phoneNumber: "07777777777", address: null },
    ];

    createRef(people, "name", "phoneNumber");
    expect(people).toEqual(copy);
  });
});

describe("valuesFormatter", () => {
  const testData = [
    {
      slug: "euro game",
      description: "Abstact games that involve little luck",
    },
    {
      slug: "social deduction",
      description: "Players attempt to uncover each other's hidden role",
    },
  ];
  test("should return a nested array of the values", () => {
    const output = [
      ["euro game", "Abstact games that involve little luck"],
      [
        "social deduction",
        "Players attempt to uncover each other's hidden role",
      ],
    ];

    expect(valuesFormatter(testData, ["slug", "description"])).toEqual(output);
  });
  test("should not mutate the original array", () => {
    const copy = [
      {
        slug: "euro game",
        description: "Abstact games that involve little luck",
      },
      {
        slug: "social deduction",
        description: "Players attempt to uncover each other's hidden role",
      },
    ];

    valuesFormatter(testData, ["slug", "description"]);
    expect(testData).toEqual(copy);
  });
});

describe("commentsFormatter", () => {
  const testData = [
    {
      body: "I loved this game too!",
      belongs_to: "Jenga",
      created_by: "bainesface",
      votes: 16,
      created_at: new Date(1511354613389),
    },
    {
      body: "My dog loved this game too!",
      belongs_to: "Ultimate Werewolf",
      created_by: "mallionaire",
      votes: 13,
      created_at: new Date(1610964545410),
    },
  ];

  const refObj = {
    Jenga: 2,
    "Ultimate Werewolf": 3,
  };

  test("should return a nested array of the values", () => {
    const output = [
      ["bainesface", 2, 16, new Date(1511354613389), "I loved this game too!"],
      [
        "mallionaire",
        3,
        13,
        new Date(1610964545410),
        "My dog loved this game too!",
      ],
    ];

    expect(commentsFormatter(testData, refObj)).toEqual(output);
  });
  test("should not mutate the original array", () => {
    const copy = [
      {
        body: "I loved this game too!",
        belongs_to: "Jenga",
        created_by: "bainesface",
        votes: 16,
        created_at: new Date(1511354613389),
      },
      {
        body: "My dog loved this game too!",
        belongs_to: "Ultimate Werewolf",
        created_by: "mallionaire",
        votes: 13,
        created_at: new Date(1610964545410),
      },
    ];
    commentsFormatter(testData, refObj);
    expect(testData).toEqual(copy);
  });
});

describe("insertToTable", () => {
  test("should output the correcting formatted SQL insert query string", () => {
    table = "users";
    columns = ["username", "avatar_url", "name"];
    values = [
      [
        "mallionaire",
        "haz",
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
      ],
      [
        "philippaclaire9",
        "philippa",
        "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4"
      ],
    ];

    output = `
    INSERT INTO users
    (username,avatar_url,name)
    VALUES
    ('mallionaire', 'haz', 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'), ('philippaclaire9', 'philippa', 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4')`;

    expect(insertToTable(table, columns, values)).toBe(output);
  });
});
