require("dotenv").config();
const fs = require('fs');
const request=require('request-promise');
const hubspot = require("@hubspot/api-client");
const time = new Date();

let accessToken;
let refreshToken;
let email;
let userdata;
let session = {};

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

  async loginOauth(req, res){
    if (!req.query.code) {
      res.send("ERROR");
      return res.end();
    }

    const formData = {
      grant_type: 'authorization_code',
      client_id: process.env.HS_CLIENT_ID,
      client_secret: process.env.HS_CLIENT_SECRET,
      redirect_uri: process.env.HS_REDIRECT_URI,
      code: req.query.code
    };

    await request.post('https://api.hubapi.com/oauth/v1/token', { form: formData }, (err, data) => {
      const body = JSON.parse(data.body)
      accessToken = body.access_token;
      refreshToken = body.refresh_token;
      console.log('RefreshToken '+refreshToken)
      console.log('AccessToken '+accessToken)   
  })

  // Using this to get the user information
    await request.get(`https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`,(err,data)=>{
      const data_body=JSON.parse(data.body)
      let loginTime = time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
      data_body.created_at = loginTime;
      userdata = JSON.stringify(data_body, null, 2)
      email=data_body.user;
      console.log('email '+email)
  })

    const refreshformData = {
      grant_type: 'refresh_token',
      client_id: process.env.HS_CLIENT_ID,
      client_secret: process.env.HS_CLIENT_SECRET,
      redirect_uri: process.env.HS_REDIRECT_URI,
      refresh_token: refreshToken
    };
    
    await request.post('https://api.hubapi.com/oauth/v1/token', { form: refreshformData }, (err, data) => {
      const body = JSON.parse(data.body)
      res.send(body)
    })

    
    session = req.session;
    session.userEmail=email;

    fs.writeFile(`./userInfo/${email}.json`,userdata,(err,data)=>{
      res.redirect('/hubspot/contacts');
    });

},

  async getContacts(req, res) {
    if(!session.userEmail){
      res.send('ERROR <a href="/hubspot/login">Login</a>');
      res.end();
    }
    res.send('dashboard')
    // try {
    //   const hubspotClient = new hubspot.Client({"accessToken":accessToken});
    //   const limit = req.params.limit || 100;
    //   const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
    //   let contacts = response.results || [];
    //   res.send(contacts);
    // } catch (e) {
    //   res.send(e.response);
    // }
    res.end();
  },

  async getContactById(req, res) {
    try {
      if(session.userEmail===email){
      const hubspotClient = new hubspot.Client({"accessToken":accessToken});
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
      if(session.userEmail===email){
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
      if(session.userEmail===email){
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
      if(session.userEmail===email){
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
      if(session.userEmail===email){
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
