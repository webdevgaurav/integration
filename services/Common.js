const request = require('request-promise');

const Common = {
  getAccessToken(grantType, token) {
    let codeName = 'code';
    if (grantType === 'refresh_token') {
      codeName = 'refresh_token';
    }
    const formData = {
      grant_type: grantType,
      client_id: process.env.HS_CLIENT_ID,
      client_secret: process.env.HS_CLIENT_SECRET,
      redirect_uri: process.env.HS_REDIRECT_URI,
      [codeName]: token,
    };
    return new Promise((resolve, reject) => {
      request.post(
        'https://api.hubapi.com/oauth/v1/token',
        { form: formData },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(data.body));
          }
        }
      );
    });
  },

  getUserInfo(accessToken) {
    return new Promise(function (resolve, reject) {
      request.get(
        `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`,
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(JSON.parse(data.body));
          }
        }
      );
    });
  },

};

module.exports = Common;
