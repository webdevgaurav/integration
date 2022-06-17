const jsforce = require('jsforce');
const playbookData = require('./../utils/playbookData');

module.exports = async function (req, res, oauth2) {
  return new Promise((resolve, reject)=>{
   
      const conn = new jsforce.Connection({
        oauth2: oauth2,
        instanceUrl: req.query.instanceUrl,
        accessToken: req.query.accessToken,
        refreshToken: req.query.refreshToken,
      });

      conn.on('refresh', async function (accessToken, res) {

        if (accessToken) {
          console.log('Inside refresh token');
          // await playbookData.sendPlaybookData(req.session.url, conn);
        }

      });

      resolve(conn);
  })
};
