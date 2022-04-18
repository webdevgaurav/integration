require("dotenv").config();
const hubspot = require("@hubspot/api-client");
const hubspotClient = new hubspot.Client({
  apiKey: process.env.API_KEY,
});

const HubSpot = {

  login(req,res){
    // Build the auth URL
    const authUrl =
      'https://app.hubspot.com/oauth/authorize' +
      `?client_id=${encodeURIComponent(process.env.HS_CLIENT_ID)}` +
      `&scope=${encodeURIComponent(process.env.HS_SCOPES)}` +
      `&redirect_uri=${encodeURIComponent(process.env.HS_REDIRECT_URI)}`;
    // Redirect the user
    return res.redirect(authUrl);
  },
  loginOauth(req,res){
    if (req.query.code) {
      console.log(req.query)
    }
  },
  async getContacts(req, res) {
    try {
      const limit = req.params.limit || 100;
      const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
      let contacts = response.results || [];
      res.send(contacts);
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async getContactById(req, res) {
    try {
      const contactId = req.params.id;
      const response = await hubspotClient.crm.contacts.basicApi.getById(
        contactId
      );
      res.send(response);
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async getContactByEmail(req, res) {
    try {
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
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async createContact(req, res) {
    try {
      const properties = { properties: req.body };
      const response = await hubspotClient.crm.contacts.basicApi.create(
        properties
      );
      res.send(response);
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async updateContact(req, res) {
    try {
      const contactId = req.params.id;
      const properties = { properties: req.body };
      const response = await hubspotClient.crm.contacts.basicApi.update(
        contactId,
        properties
      );
      res.send(response);
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },

  async deleteContact(req, res) {
    try {
      const contactId = req.params.id;
      const response = await hubspotClient.crm.contacts.basicApi.archive(
        contactId
      );
      res.send(`success`);
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },
};

module.exports = HubSpot;
