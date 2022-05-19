const fs = require('fs');
const jsforce = require('jsforce');
const Common = require('../services/Common');

const limit = 3;
let offset;

const {
  SF_LOGIN_URL,
  SF_CONSUMER_KEY,
  SF_CONSUMER_SECRET_KEY,
  SF_CALLBACK_URL,
} = process.env;

const oauth2 = new jsforce.OAuth2({
  clientId: SF_CONSUMER_KEY,
  clientSecret: SF_CONSUMER_SECRET_KEY,
  redirectUri: SF_CALLBACK_URL,
});

const validation = function (req, res) {
  if (!req.session.email) {
    return res.send('Not Authorized. <a href="/salesforce/login">Login</a>');
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
    conn.on('refresh', function (accessToken, res) {
      console.log('inside refresh token');
      let email = userFile.email;
      req.session.accessToken = accessToken;
      userFile.access_token = accessToken;
      userFile = JSON.stringify(userFile, null, 2);
      fs.writeFileSync(`./storage/salesforce/${email}.json`, userFile);
    });
    return conn;
  }
};

const Salesforce = {
  login(req, res) {
    const url = `https:://${req.params.domain}.playbook.ai/integration/salesforce/token`;
    req.session.url = url;
    console.log('login');
    res.redirect(oauth2.getAuthorizationUrl({}));
  },

  async loginOauth(req, res) {
    if (!req.query.code) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>');
    }
    const conn = new jsforce.Connection({ oauth2: oauth2 });

    await conn.authorize(req.query.code, function (err) {
      if (err) {
        return console.error(err);
      }
    });

    const response = await conn.identity(function (err, res) {
      if (err) {
        return console.error(err);
      } else {
        return res;
      }
    });
    req.session.email = response.username;
    req.session.instanceUrl = conn.instanceUrl;
    req.session.accessToken = conn.accessToken;
    req.session.refreshToken = conn.refreshToken;

    await Common.saveSFUserInfo(conn, response);
    return res.redirect('/salesforce/leads');
  },

  async getDetails(req, res) {
    let model = 'Lead';
    if (req.params.type === 'contacts') {
      model = 'Contact';
    } else if (req.params.type === 'tasks') {
      model = 'Task';
    }
    if (req.params.pageno) {
      let pageno = req.params.pageno - 1;
      offset = limit * pageno;
    }
    try {
      const conn = await validation(req, res);
      conn
        .sobject(model)
        .find({})
        .limit(limit)
        .offset(offset)
        .execute(function (err, rets) {
          if (err) {
            return res.json(err);
          }
          return res.json(rets);
        });
    } catch (e) {
      return res.send(e.res);
    }
  },

  async getContactById(req, res) {
    const contactId = req.params.id;
    try {
      const conn = await validation(req, res);
      conn
        .sobject('Contact')
        .find({ Id: { $eq: contactId } })
        .execute(function (err, rets) {
          if (err) {
            return res.json(err);
          }
          return res.json(rets);
        });
    } catch (e) {
      res.send(e.res);
    }
  },

  async getDetailsByEmail(req, res) {
    let model = 'Lead';
    if (req.params.type === 'contact') {
      model = 'Contact';
    }
    const email = req.params.email;
    try {
      const conn = await validation(req, res);
      conn
        .sobject(model)
        .find({ Email: { $eq: email } })
        .execute(function (err, record) {
          if (err) {
            return console.error(err);
          }
          return res.status(200).send(record);
        });
    } catch (e) {
      return res.send(e.res);
    }
  },

  async createContact(req, res) {
    const createProperties = req.body;
    try {
      const conn = await validation(req, res);
      conn.sobject('Contact').create(createProperties, function (err, ret) {
        if (err || !ret.success) {
          return res.json(err);
        }
        return res.send('Contact Created Successfully : ' + ret.id);
      });
    } catch (e) {
      return res.send(e.res);
    }
  },

  async updateContact(req, res) {
    const contactId = req.params.id;
    const updateProperties = req.body;
    try {
      const conn = await validation(req, res);
      conn
        .sobject('Contact')
        .find({ Id: { $eq: contactId } })
        .update(updateProperties, function (err, rets) {
          if (err) {
            return console.error(err);
          }
          return res.send('Contact Updated Successfully : ' + rets);
        });
    } catch (e) {
      return res.send(e.response);
    }
  },

  async deleteContact(req, res) {
    const contactId = req.params.id;
    try {
      const conn = await validation(req, res);
      conn.sobject('Contact').destroy(contactId, function (err, ret) {
        if (err || !ret.success) {
          return res.json(err);
        }
        return res.send('Contact Deleted Successfully : ' + ret.id);
      });
    } catch (e) {
      return res.send(e.response);
    }
  },

  async createTask(req, res) {
    const createProperties = req.body;
    if (!createProperties.WhoId) {
      return res.status(404).send('id is required');
    }
    try {
      const conn = await validation(req, res);
      conn.sobject('Task').create(createProperties, function (err, ret) {
        if (err || !ret.success) {
          return res.json(err);
        }
        return res.send('Task Created successfully: ' + ret);
      });
    } catch (e) {
      res.send(e.response);
    }
  },

  async logout(req, res) {
    try {
      const conn = await validation(req, res);
      conn.logout(function (err) {
        if (err) {
          return res.json(err);
        }
      });
      req.session.destroy();
      return res.send('logged out');
    } catch (e) {
      res.send(e.response);
    }
  },
};

module.exports = Salesforce;
