const jsforce = require('jsforce');

const APIFeatures = require('./../utils/apiFeatures');
const APIAuthentication = require('./../utils/APIAuthentication');
const playbookData = require('./../utils/playbookData');
const catchAsync = require('./../utils/catchAsync');

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

exports.login = catchAsync(async (req, res, next) => {
  console.log(req.query.url);
  // const url = `https:://${req.params.domain}.playbook.ai/client/salesforce/callback`;
  
  const url = req.query.url;
  req.session.url = url;

  await res.redirect(oauth2.getAuthorizationUrl({}));
});

exports.loginOauth = catchAsync(async (req, res, next) => {
  console.log('salesforce API');
  if (!req.query.code) {
    return res.json('Not Authorized. <a href="/salesforce/login">Login</a>');
  }

  let conn = new jsforce.Connection({ oauth2: oauth2 });

  await conn.authorize(req.query.code);

  let response = await conn.identity(function (err, rets) {
    if(err){
      next(err);
    }
  });
  
  req.session.email = response.email;
  await playbookData.sendPlaybookData(req.session.url, conn);

  return res.json({
    message: 'token sent to playbook',
  })

});

exports.getClientDetails = catchAsync(async (req, res, next) => {

  const conn = await APIAuthentication(req, res, oauth2);

  const features = new APIFeatures(conn, req.query)
    .selectModel()
    .find()
    .sort()
    .paginate();

  await features.query.execute(function (err, rets) {
    if (!err) {
      return res.json(rets);
    }
    next(err);
  });

});

exports.createClient = catchAsync(async (req, res, next) => {
  const createProperties = req.body;
  if (req.query.model === 'task') {
    if (!createProperties.WhoId) {
      return res.send('WhoId is required for creating a task');
    }
  }
  const conn = await APIAuthentication(req, res, oauth2);
  const features = new APIFeatures(conn, req.query).selectModel();
  await features.query.create(createProperties, function (err, rets) {
    if (!err) {
      return res.json(rets);
    }
    next(err);
  });
});

exports.updateClient = catchAsync(async (req, res, next) => {
  const updateProperties = req.body;
  const conn = await APIAuthentication(req, res, oauth2);
  const features = new APIFeatures(conn, req.query).selectModel().find();
  await features.query.update(updateProperties, function (err, rets) {
    if (!err) {
      return res.json(rets);
    }
    next(err);
  });
});

exports.deleteClient = catchAsync(async (req, res, next) => {
  const conn = await APIAuthentication(req, res, oauth2);
  const features = new APIFeatures(conn, req.query).selectModel().find();
  await features.query.destroy(function (err, rets) {
    if (!err || rets) {
      return res.json(rets);
    }
    next(err);
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const conn = await APIAuthentication(req, res, oauth2);
  conn.logout(function (err) {
    if (!err) {
      req.session.destroy();
      return res.json('logged out');
    }
    next(err);
  });
});
