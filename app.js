require('dotenv').config();
const express = require('express');

const hubspotRouter = require('./routes/hubspot');
const salesforceRouter = require('./routes/salesforce');
const errorHandler = require('./utils/errorHandler');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('UjWnZr4u7x!A%D*G'));

app.set('trust proxy', 1);

app.use(
  session({
    secret: 'UjWnZr4u7x!A%D*G',
    resave: false,
    store: new session.MemoryStore(),
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use('/hubspot', hubspotRouter);
app.use('/salesforce', salesforceRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'failed',
    message: `Can't find ${req.originalUrl} on the server!`,
  });
});

app.use(errorHandler);
module.exports = app;
