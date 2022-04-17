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
      console.log("i am in get contacts");
      await conn.login(
        SF_USERNAME,
        SF_PASSWORD + SF_TOKEN,
        function (err, userInfo) {
          if (err) {
            return console.error(err);
          }
          // console.log("Access Token: " + conn.accessToken);
          // console.log("Instance URL: " + conn.instanceUrl);
          console.log("User ID: " + userInfo.id);
          console.log("Org ID: " + userInfo.organizationId);
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

              // res.json(contacts);
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
      console.log("i am in get contact by id");
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
      console.log("i am in post contact");
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
      console.log("i am in put contact");
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
      console.log("i am in delete contact");
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