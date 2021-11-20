const { hashPassword } = require("../../helper-functions");

exports.createRef = (arr, key, val) => {
  const refObj = {};
  arr.forEach((el) => {
    refObj[el[key]] = el[val];
  });
  return refObj;
};

exports.commentsFormatter = (commentData, refObj) => {
  return commentData.map((comment) => {
    return [
      comment.created_by,
      refObj[comment.belongs_to],
      comment.votes,
      comment.created_at,
      comment.body,
    ];
  });
};

exports.usersFormatter = (userData) => {
  return Promise.all(
    userData.map(async ({ username, avatar_url, name, password }) => {
      const hashedPassword = await hashPassword(password);
      return [username, avatar_url, name, hashedPassword];
    })
  );
};

exports.valuesFormatter = (data, columns) => {
  return data.map((object) => {
    return columns.map((column) => object[column]);
  });
};
