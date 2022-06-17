const fs = require('fs');
const jsforce = require('jsforce');
const playbookData = require('./../utils/playbookData');

module.exports = async function (req, res, token, oauth2) {
  return new Promise((resolve, reject)=>{

    if (!req.session.email) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>');
    } else {

      const conn = new jsforce.Connection({
        oauth2: oauth2,
        instanceUrl: token.instanceUrl,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      });

      conn.on('refresh', async function (accessToken, res) {

        if (token.accessToken != accessToken) {
          console.log('Inside refresh token');
          await playbookData.sendPlaybookData(req.session.url, conn, accessToken);
        }

      });

      resolve(conn);

    }
  })
};
