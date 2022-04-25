const express = require('express')
const router = express.Router()

const salesforce = require('../services/Salesforce')

router.get('/login', salesforce.login)
router.get('/loginOauth', salesforce.loginOauth)
router.post('/contact', salesforce.createContact)
router.put('/contact', salesforce.updateContact)
router.get('/contact/:id', salesforce.getContactById)
router.delete('/contact/:id', salesforce.deleteContact)
router.get('/contacts/:limit?', salesforce.getContacts)
router.get('/logout', salesforce.logout)

module.exports = router
