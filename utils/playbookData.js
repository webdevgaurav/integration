const axios = require('axios').default;

exports.sendPlaybookData = async function (url, conn) {
  return new Promise((resolve, reject) => {
    let token = {
      instanceUrl: conn.instanceUrl,
      accessToken: conn.accessToken,
      refreshToken: conn.refreshToken,
    };

    axios.post(url, token).then(() => {
      resolve();
    }).catch(err => {
      reject(err);
    })

  })
};

exports.HSsendPlaybookData = async function (url, token, accessToken) {
  return new Promise((resolve, reject) => {
    let currentDateTime = new Date();
    let tokenCreatedAt = currentDateTime.getTime() / 1000;

    if (accessToken) {
      token.access_token = accessToken;
    }
    token.created_at = Number(tokenCreatedAt);

    axios.post(url, token).then(() => {
      resolve();
    }).catch((err) => {
      reject(err);
    });
  });

};