require('dotenv').config();

const fs = require('fs');
const Common = require('./Common');
const request = require('request-promise');
const hubspot = require('@hubspot/api-client');

const hubspotClient = new hubspot.Client();

let session = {};
const d = new Date();

const HubSpot = {

  login(req,res) {
    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(process.env.HS_CLIENT_ID)}&scope=${encodeURIComponent(process.env.HS_SCOPES)}&redirect_uri=${encodeURIComponent(process.env.HS_REDIRECT_URI)}`;
    return res.redirect(authUrl);
  },

  async loginOauth(req, res) {
    if(!req.query.code){
      return res.send('Not Authorized. <a href="/hubspot/login">Login</a>');
    }

    let tokenData = await Common.getAccessToken('authorization_code', req.query.code);
    if(!tokenData.access_token){
      return res.send(`${tokenData.message} <a href="/hubspot/login">Login</a>`);
    }

    let userData = await Common.getUserInfo(tokenData.access_token);
    if(!userData.user){
      return res.send(`${userData.message} <a href="/hubspot/login">Login</a>`);
    }

    session = req.session;
    session.email = userData.user;

    Common.saveUserInfo(tokenData, userData.user);

    return res.redirect('/hubspot/contacts');
  },

  async getContacts(req, res) {
    if(!session.email){
      return res.send('Not Authorized. <a href="/hubspot/login">Login</a>');
    }

    try{
      let tokenData = fs.readFileSync(`./userInfo/${session.email}.json`);
      tokenData = JSON.parse(tokenData);

      if(now > tokenData.created_at + tokenData.expires_in){
        tokenData = await Common.getAccessToken('refresh_token', tokenData.refresh_token);
        Common.saveUserInfo(tokenData, session.email);
      }

      hubspotClient.setAccessToken(tokenData.access_token);

      const limit = req.params.limit || 100;
      const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
      let contacts = response.results || [];
      return res.send(contacts);
    }catch(e){
      return res.send(e);
    }
  },

  async getContactById(req, res) {
    try {
      if(session.email===email){
        const hubspotClient = new hubspot.Client({'accessToken': accessToken});
        const contactId = req.params.id;
        const response = await hubspotClient.crm.contacts.basicApi.getById(
          contactId
        );
        res.send(response);
      }
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async getContactByEmail(req, res) {
    try {
      if(session.email===email){
        const hubspotClient = new hubspot.Client({"accessToken":accessToken});
        const search = {
          filterGroups: [
            {
              filters: [
                {
                  operator: "EQ",
                  propertyName: "email",
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
      }
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async createContact(req, res) {
    try {
      if(session.email===email){
        const hubspotClient = new hubspot.Client({"accessToken":accessToken});
        const properties = { properties: req.body };
        const response = await hubspotClient.crm.contacts.basicApi.create(
          properties
        );
        res.send(response);
      }
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async updateContact(req, res) {
    try {
      if(session.email===email){
        const hubspotClient = new hubspot.Client({"accessToken":accessToken});
        const contactId = req.params.id;
        const properties = { properties: req.body };
        const response = await hubspotClient.crm.contacts.basicApi.update(
          contactId,
          properties
        );
        res.send(response);
      }
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async deleteContact(req, res) {
    try {
      if(session.email===email){
        const hubspotClient = new hubspot.Client({"accessToken":accessToken});
        const contactId = req.params.id;
        const response = await hubspotClient.crm.contacts.basicApi.archive(
          contactId
        );
        res.send(`success`);
      }
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },
};

module.exports = HubSpot;
