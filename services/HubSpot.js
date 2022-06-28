const fs = require('fs');

const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client();

const Common = require('../services/Common');
const APIAuthentication = require('./../utils/APIAuthentication');
const playbookData = require('./../utils/playbookData');
const catchAsync = require('./../utils/catchAsync');

const {
  HS_CLIENT_ID,
  HS_CLIENT_SECRET,
  HS_SCOPES,
  HS_REDIRECT_URI,
} = process.env;

exports.login = catchAsync(async (req, res) => {
  req.session.url = req.query.url;
  const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(
    HS_CLIENT_ID
  )}&scope=${encodeURIComponent(
    HS_SCOPES
  )}&redirect_uri=${encodeURIComponent(HS_REDIRECT_URI)}`;
  return res.redirect(authUrl);
});

exports.loginOauth = catchAsync(async (req, res) => {
  if (!req.query.code) {
    return res.send('Not Authorized. <a href="/hubspot/login">Login</a>');
  };

  let token = await Common.getAccessToken(
    'authorization_code',
    req.query.code
  );
  if (!token.access_token) {
    return res.send(
      `${token.message} <a href="/hubspot/login">Login</a>`
    );
  };

  let userData = await Common.getUserInfo(token.access_token);
  if (!userData.user) {
    return res.send(`${userData.message} <a href="/hubspot/login">Login</a>`);
  };

  await playbookData.HSsendPlaybookData(req.session.url, token);

  return res.json({
    message: 'token sent to playbook',
  })

});

exports.getClientDetails = catchAsync(async (req, res) => {
  try {
    const accesstoken = await APIAuthentication.hsAuthentication(req, res);
    hubspotClient.setAccessToken(accesstoken);

    let limit = req.query.limit || 100;
    let after = req.query.after || undefined;
    let data;

    if (req.query.id) {
      const contactId = req.query.id;
      let response = await hubspotClient.crm.contacts.basicApi.getById(
        contactId
      );
      data = response;

    } else if ((req.query.startDate && req.query.endDate) || (req.query.startDate || req.query.endDate) || req.query.email) {
      let startDate = req.query.startDate;
      let endDate = req.query.endDate;
      let filter = [];

      if (startDate && endDate) {
        const start_date = new Date(startDate);
        const end_date = new Date(endDate);
        startDate = start_date.getTime();
        endDate = end_date.getTime();

        filter = [{ propertyName: 'createdate', operator: 'GTE', value: startDate }, { propertyName: 'createdate', operator: 'LTE', value: endDate }];

      } else if (startDate || endDate) {
        let date = req.query.startDate;
        let operator = 'GTE';

        if (req.query.endDate) {
          date = req.query.endDate;
          operator = 'LTE';
        };

        const myDate = new Date(date);
        const createdate = myDate.getTime();
        filter = [{ propertyName: 'createdate', operator: operator, value: createdate }];

      } else if (req.query.email) {
        filter = [{ propertyName: 'email', operator: 'EQ', value: req.query.email }];
      }

      const filterGroup = { filters: filter };
      const sort = JSON.stringify({ propertyName: 'createdate', direction: 'DESCENDING' });
      const properties = ['createdate', 'firstname', 'lastname', 'email', 'hs_lead_status'];
      const search = {
        filterGroups: [filterGroup],
        sorts: [sort],
        properties,
        limit,
      };

      let response = await hubspotClient.crm.contacts.searchApi.doSearch(
        search
      );

      data = response.results || [];

    } else {
      const properties = ['createdate', 'firstname', 'lastname', 'email', 'hs_lead_status', 'lastmodifieddate', 'phone'];
      let response = await hubspotClient.crm.contacts.basicApi.getPage(limit, after, properties);
      data = response.results || [];
    }

    return res.json(data);
  } catch (e) {
    return res.json({ 'ERROR': e });
  }
});

exports.createClient = catchAsync(async (req, res) => {
  const accesstoken = await APIAuthentication.hsAuthentication(req, res);
  try {
    hubspotClient.setAccessToken(accesstoken);
    const properties = { properties: req.body };
    const response = await hubspotClient.crm.contacts.basicApi.create(
      properties
    );
    return res.json(response);
  } catch (e) {
    return res.json({ 'ERROR': e });
  }
});

exports.updateClient = catchAsync(async (req, res) => {
  const accesstoken = await APIAuthentication.hsAuthentication(req, res);
  try {
    hubspotClient.setAccessToken(accesstoken);
    const contactId = req.query.id;
    const properties = { properties: req.body };
    const response = await hubspotClient.crm.contacts.basicApi.update(
      contactId,
      properties
    );
    return res.json(response);
  } catch (e) {
    return res.json({ 'ERROR': e });
  }
});

exports.deleteClient = catchAsync(async (req, res) => {
  const accesstoken = await APIAuthentication.hsAuthentication(req, res);
  try {
    hubspotClient.setAccessToken(accesstoken);
    const contactId = req.query.id;
    await hubspotClient.crm.contacts.basicApi.archive(
      contactId
    );
    return res.json(contactId + ' Deleted Successfully');
  } catch (e) {
    return res.json({ 'ERROR': e });
  }
});
