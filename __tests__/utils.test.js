const { valuesFormatter } = require("../db/utils/data-manipulation.js");

describe("valuesFormatter", () => {
  test("should return a nested array of the values", () => {
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

    const output = [
      ["euro game", "Abstact games that involve little luck"],
      [
        "social deduction",
        "Players attempt to uncover each other's hidden role",
      ],
    ];

    expect(valuesFormatter(testData, "slug", "description")).toEqual(output);
  });
});
