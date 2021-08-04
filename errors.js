exports.handle404s = (req, res, next) => {
  res.status(404).send({ message: "Invalid path" });
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "Invalid review_id" });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  const { status, message } = err;
  if (status) {
    res.status(status).send({ message });
  } else {
    next(err);
  }
};

exports.handle500s = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: "Server side error" });
};
