const axios = require('axios').default;

exports.sendPlaybookData = async function (url, conn) {
  return new Promise((resolve, reject)=>{
    let data = {};
  data.instanceUrl = conn.instanceUrl;
  data.accessToken = conn.accessToken;
  data.refreshToken = conn.refreshToken;
  resolve(axios.post('http://playbookai.loc/client/salesforce/callback',  data ));
  })
};

