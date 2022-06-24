const express = require('express');
const router = express.Router();

const hubSpot = require('../services/HubSpot');

router.get('/login', hubSpot.login);
router.get('/loginOauth', hubSpot.loginOauth);

router
    .route('/')
    .get(hubSpot.getClientDetails)
    .post(hubSpot.createClient)
    .put(hubSpot.updateClient)
    .delete(hubSpot.deleteClient);

module.exports = router;
