const express = require('express');
const router = express.Router();

const salesforce = require('../services/Salesforce');

router.get('/login/:domain', salesforce.login);
router.get('/loginOauth', salesforce.loginOauth);

router.post('/contact', salesforce.createContact);

router
  .route('/contact/:id')
  .get(salesforce.getContactById)
  .delete(salesforce.deleteContact)
  .put(salesforce.updateContact);

router.get('/:type/email/:email', salesforce.getDetailsByEmail);
router.post('/task', salesforce.createTask);
router.get('/logout', salesforce.logout);
router.get('/:type/:pageno?', salesforce.getDetails);

module.exports = router;
