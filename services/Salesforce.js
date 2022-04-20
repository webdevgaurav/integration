const jsforce = require("jsforce");
const {
  SF_LOGIN_URL,
  SF_USERNAME,
  SF_PASSWORD,
  SF_TOKEN,
  SF_CONSUMER_KEY,
  SF_CONSUMER_SECRET_KEY,
} = process.env;

const conn = new jsforce.Connection({
  oauth2: {
    loginUrl: SF_LOGIN_URL,
    clientId: SF_CONSUMER_KEY,
    clientSecret: SF_CONSUMER_SECRET_KEY,
  },
});
const Salesforce= {
 async getContacts  (req, res) {
    try {
      await conn.login(
        SF_USERNAME,
        SF_PASSWORD + SF_TOKEN,
        function (err, userInfo) {
          if (err) {
            return console.error(err);
          }
          conn.query(
            "SELECT Id, Name FROM Contact",
            function (error, response) {
              if (error) {
                return console.error(error);
              }
              let contacts = [];
                response.records.forEach((element) => {
                contacts.push(element);
              });
              console.log(contacts);
            }
          );
        }
      );
    } catch (e) {
      res.send(e.res);
    }
    res.end();
  },

  async getContactById  (req, res) {
    try {
      const contactId = req.params.id;
      await conn.login(
        SF_USERNAME,
        SF_PASSWORD + SF_TOKEN,
        function (err, userInfo) {
          if (err) {
            return console.error(err);
          }
          conn.sobject("Contact").retrieve(contactId, function (err, contact) {
            if (err) {
              return console.error(err);
            }
            console.log("Name : " + contact.Name);
          });
        }
      );
    } catch (e) {
      res.send(e.res);
    }
    res.end();
  },
  async createContact  (req, res) {
    try {
      const createProperties = req.body;
      await conn.login(
        SF_USERNAME,
        SF_PASSWORD + SF_TOKEN,
        function (err, userInfo) {
          if (err) {
            return console.error(err);
          }
          conn.sobject("Contact").create(createProperties, function (err, ret) {
            if (err || !ret.success) {
              return console.error(err, ret);
            }
            console.log("Created record id : " + ret.id);
          });
        }
      );
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },
 async updateContact (req, res) {
    try {
      const updateProperties = req.body;
      await conn.login(
        SF_USERNAME,
        SF_PASSWORD + SF_TOKEN,
        function (err, userInfo) {
          if (err) {
            return console.error(err);
          }
          conn.sobject("Contact").update(updateProperties, function (err, ret) {
            if (err || !ret.success) {
              return console.error(err, ret);
            }
            console.log("Updated Successfully : " + ret.id);
          });
        }
      );
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },
  async deleteContact (req, res)  {
    try {
      const contactId = req.params.id;
      await conn.login(
        SF_USERNAME,
        SF_PASSWORD + SF_TOKEN,
        function (err, userInfo) {
          if (err) {
            return console.error(err);
          }
          conn.sobject("Contact").destroy(contactId, function (err, ret) {
            if (err || !ret.success) {
              return console.error(err, ret);
            }
            res.end("Deleted Successfully : " + ret.id);
          });
        }
      );
    } catch (e) {
      res.send(e.response);
    }
    res.end();
  },
}
module.exports = Salesforce;