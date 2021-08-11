exports.handle404s = (req, res, next) => {
  res.status(404).send({ message: "Invalid path" });
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "42703") {
    res.status(400).send({ message: "Invalid datatype" });
  } else if (err.code === "23502") {
    res.status(400).send({ message: "Missing required fields" });
  } else if (err.code === "23503") {
    res.status(404).send({ message: "Insert or update violates foreign key constraint" });
  } else if (err.code === "23505") {
    res.status(400).send({ message: "Duplicate key value violates unique constraint" });
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
  res.status(500).send({ message: "Server-side error" });
};
