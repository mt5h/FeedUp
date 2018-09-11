/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  middleware: {

    passportInit    : (function (){
      return require('passport').initialize();
    })(),

    passportSession : (function (){
      return require('passport').session();
    })(),

    order: [
      'cookieParser',
      'session',
      'passportInit',
      'passportSession',
      'bodyParser',
      'compress',
      'poweredBy',
      'requestLogger',
      'router',
      'www',
      'favicon',

    ],

    requestLogger: (function (){

      console.log('Initializing `requestLogger` (HTTP middleware)...');

      return function (req,res,next) {
        post_body = '';
        if (req.body != null) {
          post_body = JSON.stringify(req.body);
        }

        console.log('Received HTTP request: ' + new Date().toISOString() + ' ' +req.method+' '+req.path+' '+post_body);
        return next();
      };
    })()
  },
};
