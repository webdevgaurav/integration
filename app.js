require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

const hubspotRouter = require("./routes/hubspot");
const salesforceRouter = require("./routes/salesforce");

app.use("/hubspot", hubspotRouter);
app.use("/salesforce", salesforceRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}...`);
});
