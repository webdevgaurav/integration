const fs = require('fs');
const Common = require('../services/Common');
const hubspot = require('@hubspot/api-client');

const hubspotClient = new hubspot.Client();

const validation = async function (req, res) {
  if (!req.headers.accessid) {
    let fileExists = fs.existsSync(
      `./storage/hubspot/${req.session.email}.json`
    );
    if (!fileExists) {
      return res.send('Not Authorized. <a href="/hubspot/login">Login</a>');
    }
  }
  if (!req.session.email) {
    return res.send('Not Authorized. <a href="/hubspot/login">Login</a>');
  } else {
    let tokenData = fs.readFileSync(
      `./storage/hubspot/${req.session.email}.json`
    );
    tokenData = JSON.parse(tokenData);
    let accesstoken = await Common.compareTime(tokenData, req.session.email);
  }
};

const HubSpot = {
  login(req, res) {
    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(
      process.env.HS_CLIENT_ID
    )}&scope=${encodeURIComponent(
      process.env.HS_SCOPES
    )}&redirect_uri=${encodeURIComponent(process.env.HS_REDIRECT_URI)}`;
    return res.redirect(authUrl);
  },

  async loginOauth(req, res) {
    if (!req.query.code) {
      return res.send('Not Authorized. <a href="/hubspot/login">Login</a>');
    }
    let tokenData = await Common.getAccessToken(
      'authorization_code',
      req.query.code
    );
    if (!tokenData.access_token) {
      return res.send(
        `${tokenData.message} <a href="/hubspot/login">Login</a>`
      );
    }
    let userData = await Common.getUserInfo(tokenData.access_token);
    if (!userData.user) {
      return res.send(`${userData.message} <a href="/hubspot/login">Login</a>`);
    }
    Common.saveUserInfo(tokenData, userData.user);
    req.session.email = userData.user;
    req.session.accessToken = tokenData.access_token;
    return res.redirect('/hubspot/contacts');
  },

  async getContacts(req, res) {
    const accesstoken = await validation(req, res);
    try {
      hubspotClient.setAccessToken(accesstoken);
      const limit = req.params.limit || 100;
      const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
      let contacts = response.results || [];
      return res.send(contacts);
    } catch (e) {
      return res.send('ERROR ' + e);
    }
  },

  async getContactById(req, res) {
    const accesstoken = await validation(req, res);
    try {
      hubspotClient.setAccessToken(accesstoken);
      const contactId = req.params.id;
      const response = await hubspotClient.crm.contacts.basicApi.getById(
        contactId
      );
      res.send(response);
    } catch (e) {
      return res.send('ERROR ' + e);
    }
  },

  async getContactByEmail(req, res) {
    const accesstoken = await validation(req, res);
    try {
      hubspotClient.setAccessToken(accesstoken);
      const search = {
        filterGroups: [
          {
            filters: [
              {
                operator: 'EQ',
                propertyName: 'email',
                value: req.params.email,
              },
            ],
          },
        ],
      };
      const response = await hubspotClient.crm.contacts.searchApi.doSearch(
        search
      );
      let contacts = response.results[0] || {};
      res.send(contacts);
    } catch (e) {
      return res.send('ERROR ' + e);
    }
  },

  async createContact(req, res) {
    const accesstoken = await validation(req, res);
    try {
      hubspotClient.setAccessToken(accesstoken);
      const properties = { properties: req.body };
      const response = await hubspotClient.crm.contacts.basicApi.create(
        properties
      );
      res.send(response);
    } catch (e) {
      return res.send('ERROR ' + e);
    }
  },

  async updateContact(req, res) {
    const accesstoken = await validation(req, res);
    try {
      hubspotClient.setAccessToken(accesstoken);
      const contactId = req.params.id;
      const properties = { properties: req.body };
      const response = await hubspotClient.crm.contacts.basicApi.update(
        contactId,
        properties
      );
      res.send(response);
    } catch (e) {
      return res.send('ERROR ' + e);
    }
  },

  async deleteContact(req, res) {
    const accesstoken = await validation(req, res);
    try {
      hubspotClient.setAccessToken(accesstoken);
      const contactId = req.params.id;
      const response = await hubspotClient.crm.contacts.basicApi.archive(
        contactId
      );
      res.send(`success`);
    } catch (e) {
      return res.send('ERROR ' + e);
    }
  },
};

module.exports = HubSpot;
