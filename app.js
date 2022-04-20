require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require('express-session')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret : 'thisismysecrctekeyfhrgfgrfrty84fwir767',
  resave : false ,
  saveUninitialized : true ,
  cookie: { 
    secure: true ,
    maxAge: 1000 * 60 * 60 * 24 ,
  }
}))

const hubspotRouter = require("./routes/hubspot");
const salesforceRouter = require("./routes/salesforce");

app.use("/hubspot", hubspotRouter);
app.use("/salesforce", salesforceRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}...`);
});
