const fs = require('fs');
const jsforce = require('jsforce');
const playbookData = require('./../utils/playbookData');

module.exports = async function (req, res, oauth2) {
  return new Promise((resolve, reject)=>{
    if (!req.session.email) {
      return res.send('Not Authorized Please . <a href="/salesforce/login">LOGIN</a>');
    } else {
      let userFile = fs.readFileSync(
        `./storage/salesforce/${req.session.email}.json`
      );
      userFile = JSON.parse(userFile);
      const conn = new jsforce.Connection({
        oauth2: oauth2,
        instanceUrl: userFile.instanceUrl,
        accessToken: userFile.access_token,
        refreshToken: userFile.refreshToken,
      });
      conn.on('refresh', async function (accessToken, res) {
        let access_token = userFile.access_token;
        if (access_token != accessToken) {
          console.log('Inside refresh token');
          // await playbookData.sendPlaybookData(req.session.url, data);
          userFile.access_token = accessToken;
          userFile = JSON.stringify(userFile, null, 2);
          fs.writeFileSync(`./storage/salesforce/${email}.json`, userFile);
        }
      });
      resolve(conn);
    }
  })
};
