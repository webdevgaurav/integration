const fs = require('fs');

const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client();
const jsforce = require('jsforce');

const playbookData = require('./../utils/playbookData');
const Common = require('../services/Common');

exports.sfAuthentication = async function (req, res, oauth2) {
  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection({
      oauth2: oauth2,
      instanceUrl: req.query.instanceUrl,
      accessToken: req.query.accessToken,
      refreshToken: req.query.refreshToken,
    });

    conn.on('refresh', async function (accessToken, res) {

      if (accessToken) {
        await playbookData.sendPlaybookData(req.query.url, conn);
      }

    });

    resolve(conn);
  })
};

exports.hsAuthentication = async function (req, res) {
  return new Promise(async (resolve, reject) => {

    let token = {
      token_type: req.query.token_type,
      refresh_token: req.query.refresh_token,
      access_token: req.query.access_token,
      expires_in: req.query.expires_in,
      created_at: req.query.created_at,
    };

    let currentDateTime = new Date();
    let currentTime = currentDateTime.getTime() / 1000;
    let expireIn = Number(token.created_at) + Number(token.expires_in) - 300;

    if (expireIn < currentTime) {

      await hubspotClient.oauth.tokensApi.createToken('refresh_token', undefined, undefined, process.env.HS_CLIENT_ID, process.env.HS_CLIENT_SECRET, token.refresh_token).then((results) => {
        playbookData.HSsendPlaybookData(req.query.url, token, results.accessToken);
        resolve(results.accessToken);
      }).catch(err => {
        reject(err);
      });

    } else {
      resolve(token.access_token);
    }
  });
};