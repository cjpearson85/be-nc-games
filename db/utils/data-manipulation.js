exports.createRef = (arr, key, val) => {
    const refObj = {};
    arr.forEach((el) => {
      refObj[el[key]] = el[val];
    });
    return refObj;
};

exports.commentsFormatter = (commentData, refObj) => {
    return commentData.map(comment => {
        return [comment.created_by, refObj[comment.belongs_to], comment.votes, comment.created_at, comment.body]
    })
};

exports.valuesFormatter = (data, columns) => {
  return data.map(object => {
    return columns.map(column => object[column])
  })
};