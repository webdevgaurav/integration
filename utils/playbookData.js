const axios = require('axios');

exports.sendPlaybookData = async function (url, conn, newAccessToken) {
  return new Promise((resolve, reject)=>{
      
      let token = {
          instanceUrl : conn.instanceUrl,
          accessToken : newAccessToken || conn.accessToken,
          refreshToken : conn.refreshToken,
        };
        
        resolve(axios.post('http:://playbookai.loc/client/salesforce/callback',  token ));

  })
};

