require('dotenv').config();
const express = require('express');

const hubspotRouter = require('./routes/hubspot');
const salesforceRouter = require('./routes/salesforce');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('thisismysecrctekeyfhrgfgrfrty84fwir767'));

app.set('trust proxy', 1);

app.use(
  session({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
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

module.exports = app;
