const fs = require('fs')
const jsforce = require('jsforce')
const Common = require('../services/Common')

const { SF_LOGIN_URL, SF_CONSUMER_KEY, SF_CONSUMER_SECRET_KEY, SF_CALLBACK_URL } = process.env

const Salesforce = {
  login(req, res) {
    console.log('login')
    const oauth2 = new jsforce.OAuth2({
      clientId: SF_CONSUMER_KEY,
      clientSecret: SF_CONSUMER_SECRET_KEY,
      redirectUri: SF_CALLBACK_URL,
    })
    res.redirect(oauth2.getAuthorizationUrl({}))
  },

  async loginOauth(req, res) {
    if (!req.query.code) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
    }
    const oauth2 = new jsforce.OAuth2({
      clientId: SF_CONSUMER_KEY,
      clientSecret: SF_CONSUMER_SECRET_KEY,
      redirectUri: SF_CALLBACK_URL,
    })
    const conn = new jsforce.Connection({ oauth2: oauth2 })

    const userInfo = await conn.authorize(req.query.code, function (err, userInfo) {
      if (err) {
        return console.error(err)
      } else {
        return userInfo
      }
    })

    const conn2 = new jsforce.Connection({
      instanceUrl: conn.instanceUrl,
      accessToken: conn.accessToken,
    })

    const response = await conn2.identity(function (err, res) {
      if (err) {
        return console.error(err)
      } else {
        return res
      }
    })
    await Common.saveSFUserInfo(conn.accessToken, userInfo, response.username, conn.instanceUrl)
    req.session.email = response.username
    req.session.instanceUrl = conn.instanceUrl
    req.session.accessToken = conn.accessToken
    return res.redirect('/salesforce/contacts')
  },

  async getContacts(req, res) {
    if (!req.headers.accessid) {
      let fileExists = fs.existsSync(`./storage/salesforce/${req.session.email}.json`)
      if (!fileExists) {
        return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
      }
    }
    if (!req.session.email) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
    } else {
      try {
        let userFile = fs.readFileSync(`./storage/salesforce/${req.session.email}.json`)
        userFile = JSON.parse(userFile)
        const conn = new jsforce.Connection({
          instanceUrl: userFile.instanceUrl,
          accessToken: userFile.access_token,
        })
        conn.query('SELECT Id, Name FROM Contact', function (error, response) {
          if (error) {
            return console.error(error)
          } else {
            let contacts = response.records || []
            console.log(contacts)
          }
        })
      } catch (e) {
        console.log(e.res)
      }
    }
    res.end()
  },

  async getContactById(req, res) {
    if (!req.headers.accessid) {
      let fileExists = fs.existsSync(`./storage/salesforce/${req.session.email}.json`)
      if (!fileExists) {
        return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
      }
    }
    if (!req.session.email) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
    } else {
      try {
        const contactId = req.params.id
        let userFile = fs.readFileSync(`./storage/salesforce/${req.session.email}.json`)
        userFile = JSON.parse(userFile)
        const conn = new jsforce.Connection({
          instanceUrl: userFile.instanceUrl,
          accessToken: userFile.access_token,
        })
        conn.sobject('Contact').retrieve(contactId, function (err, contact) {
          if (err) {
            return console.error(err)
          }
          console.log(contact)
        })
      } catch (e) {
        res.send(e.res)
      }
    }
    res.end()
  },
  async createContact(req, res) {
    if (!req.headers.accessid) {
      let fileExists = fs.existsSync(`./storage/salesforce/${req.session.email}.json`)
      if (!fileExists) {
        return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
      }
    }
    if (!req.session.email) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
    } else {
      try {
        const createProperties = req.body
        let userFile = fs.readFileSync(`./storage/salesforce/${req.session.email}.json`)
        userFile = JSON.parse(userFile)
        const conn = new jsforce.Connection({
          instanceUrl: userFile.instanceUrl,
          accessToken: userFile.access_token,
        })
        conn.sobject('Contact').create(createProperties, function (err, ret) {
          if (err || !ret.success) {
            return console.error(err, ret)
          }
          console.log('Created record id : ' + ret.id)
        })
      } catch (e) {
        res.send(e.response)
      }
    }
    res.end()
  },
  async updateContact(req, res) {
    if (!req.headers.accessid) {
      let fileExists = fs.existsSync(`./storage/salesforce/${req.session.email}.json`)
      if (!fileExists) {
        return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
      }
    }
    if (!req.session.email) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
    } else {
      try {
        const updateProperties = req.body

        let userFile = fs.readFileSync(`./storage/salesforce/${req.session.email}.json`)
        userFile = JSON.parse(userFile)
        const conn = new jsforce.Connection({
          instanceUrl: userFile.instanceUrl,
          accessToken: userFile.access_token,
        })
        conn.sobject('Contact').update(updateProperties, function (err, ret) {
          if (err || !ret.success) {
            return console.error(err, ret)
          }
          console.log('Updated Successfully : ' + ret.id)
        })
      } catch (e) {
        res.send(e.response)
      }
    }
    res.end()
  },
  async deleteContact(req, res) {
    if (!req.headers.accessid) {
      let fileExists = fs.existsSync(`./storage/salesforce/${req.session.email}.json`)
      if (!fileExists) {
        return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
      }
    }
    if (!req.session.email) {
      return res.send('Not Authorized. <a href="/salesforce/login">Login</a>')
    } else {
      try {
        const contactId = req.params.id
        let userFile = fs.readFileSync(`./storage/salesforce/${req.session.email}.json`)
        userFile = JSON.parse(userFile)
        const conn = new jsforce.Connection({
          instanceUrl: userFile.instanceUrl,
          accessToken: userFile.access_token,
        })
        conn.sobject('Contact').destroy(contactId, function (err, ret) {
          if (err || !ret.success) {
            return console.error(err, ret)
          }
          res.end('Deleted Successfully : ' + ret.id)
        })
      } catch (e) {
        res.send(e.response)
      }
    }
    res.end()
  },

  logout(req, res) {
    var conn = new jsforce.Connection({
      loginUrl: SF_LOGIN_URL,
      instanceUrl: req.session.instanceUrl,
      accessToken: req.session.accessToken,
    })

    conn.logout(function (err) {
      if (err) {
        return console.error(err)
      }
    })
    req.session.destroy()
    res.send('logged out')
  },
}
module.exports = Salesforce
