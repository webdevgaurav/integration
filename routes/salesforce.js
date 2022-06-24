const express = require('express');
const router = express.Router();

const salesforce = require('../services/Salesforce');

router.get('/login', salesforce.login);
router.get('/loginOauth', salesforce.loginOauth);

router
  .route('/')
  .get(salesforce.getClientDetails)
  .post(salesforce.createClient)
  .put(salesforce.updateClient)
  .delete(salesforce.deleteClient);

router.get('/logout', salesforce.logout);

module.exports = router;
