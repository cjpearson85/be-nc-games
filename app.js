const express = require('express');
const { handle404s, handlePsqlErrors, handleCustomErrors, handle500s } = require('./errors');
const apiRouter = require('./routers/api.router');
const app = express();

app.use(express.json());

app.use('/api', apiRouter);

app.use(handle404s);
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handle500s);

module.exports = app;