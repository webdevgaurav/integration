const express = require("express");
const router = express.Router();

const salesforce = require("../services/Salesforce");

router.post("/contact", salesforce.createContact);
router.put("/contact", salesforce.updateContact);
router.get("/contact/:id", salesforce.getContactById);
router.delete("/contact/:id", salesforce.deleteContact);
router.get("/contacts/:limit?", salesforce.getContacts);

module.exports = router;
