const fs = require('fs');
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

  async saveUserInfo(tokenData, email) {
    return new Promise((resolve, reject) => {
    let currentDateTime = new Date();
    let tokenCreatedAt = currentDateTime.getTime() / 1000;
    tokenData.email = email;
    tokenData.created_at = tokenCreatedAt;
    tokenData = JSON.stringify(tokenData, null, 2);
    fs.writeFileSync(`./storage/hubspot/${email}.json`, tokenData);
    })
  },

  async compareTime(tokenData, email) {
    let currentDateTime = new Date();
    let currentTime = currentDateTime.getTime() / 1000;
    let tokenCreateTime = tokenData.created_at;
    let expireIn = tokenCreateTime + Number(tokenData.expires_in);
    if (currentTime > expireIn) {
      await Common.getAccessToken(
        'refresh_token',
        tokenData.refresh_token
      ).then((tokendata) => {
        Common.saveUserInfo(tokendata, email);
      });
      let refreshAccessToken = fs.readFileSync(
        `./storage/hubspot/${email}.json`
      );
      refreshAccessToken = JSON.parse(refreshAccessToken);
      return refreshAccessToken.access_token;
    } else {
      return tokenData.access_token;
    }
  },

};

module.exports = Common;
