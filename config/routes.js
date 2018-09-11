
module.exports.routes = {

'/': {
  view: 'pages/homepage'
},


// test pages avvisi-unimi.ejs  bbc-uk.ejs  hnrss.ejs  hwup.ejs

'/test/avvisi-unimi': [
  function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    return next();
  },
  { view: 'test/avvisi-unimi', skipAssets: true, locals: {layout: false} }
],

'/test/bbc-uk': [
  function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    return next();
  },
  { view: 'test/bbc-uk', skipAssets: true, locals: {layout: false} }
],


'/test/bbc-uk-update': [
  function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    return next();
  },
  { view: 'test/bbc-uk-update', skipAssets: true, locals: {layout: false} }
],

'/test/hnrss': [
  function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    return next();
  },
  { view: 'test/hnrss', skipAssets: true, locals: {layout: false} }
],

'/test/hwup': [
  function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    return next();
  },
  { view: 'test/hwup', skipAssets: true, locals: {layout: false} }
],


// feed controller

'get /feed/dashboard/:id': {
  controller: 'FeedController',
  action: 'dashboard',
  skipAssets: false
},


'get /feed/dashboard/category/:name': {
  controller: 'FeedController',
  action: 'dashboard',
  skipAssets: false
},


'get /feed/edit/:id': {
  controller: 'FeedController',
  action: 'edit',
  skipAssets: false
},

'get /feed/query/:id': {
  controller: 'FeedController',
  action: 'query',
  skipAssets: true
},


// auth controller

'get /login': {
  view: 'user/login'
},

'post /login': {
  controller: 'AuthController',
  action: 'login',
},


'get /logout':{
  controller: 'AuthController',
  action: 'logout'
},


'get /register': {
 view: 'user/register'
},


'get /myprofile':{
  controller: 'AuthController',
  action: 'edit'
},


// 'post /user': {
//   controller: 'UserController',
//   action: 'create',
// },


'post /register': {
  controller: 'AuthController',
  action: 'register',
},

};
