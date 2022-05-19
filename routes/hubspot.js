const express = require('express');
const router = express.Router();

const HubSpot = require('../services/HubSpot');

router.get('/login', HubSpot.login);
router.get('/loginOauth', HubSpot.loginOauth);
router.post('/contact', HubSpot.createContact);
router.get('/contact/:id', HubSpot.getContactById);
router.get('/contacts/:limit?', HubSpot.getContacts);
router.get('/contact/email/:email', HubSpot.getContactByEmail);
router.put('/contact/:id', HubSpot.updateContact);
router.delete('/contact/:id', HubSpot.deleteContact);

module.exports = router;
