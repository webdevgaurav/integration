const axios = require('axios');

exports.sendPlaybookData = async function (url, conn) {
  return new Promise((resolve, reject)=>{
      console.log(url);
      let token = {
          instanceUrl : conn.instanceUrl,
          accessToken : conn.accessToken,
          refreshToken : conn.refreshToken,
        };

        let response = axios.post('http:://playbookai.loc/client/salesforce/callback',  token )
        resolve(response);

  })
};

