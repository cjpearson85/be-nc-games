const comments = require("../data/development-data/comments");

// extract any functions you are using to manipulate your data, into this file
exports.createRef = (arr, key1, key2) => {
    const refObj = {};
    arr.forEach((el) => {
      refObj[el[key1]] = el[key2];
    });
    return refObj;
  };

exports.categoriesFormatter = (categoryData) => {
  return categoryData.map((category) => {
    return [category.slug, category.description];
  });
};

exports.usersFormatter = (userData) => {
  return userData.map((user) => {
    return [user.username, user.avatar_url, user.name];
  });
};

exports.reviewsFormatter = (reviewData) => {
  return reviewData.map((review) => {
    return [review.title, review.review_body, review.designer, review.review_img_url, review.votes, review.category, review.owner, review.created_at];
  });
};

exports.commentsFormatter = (commentData, refObj) => {
    return commentData.map(comment => {
        return [comment.created_by, refObj[comment.belongs_to], comment.votes, comment.created_at, comment.body]
    })
}

exports.valuesFormatter = (data, columns) => {
  return data.map(object => {
    return columns.map(column => object[column])
  })
}