const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
bcrypt = require('bcrypt-nodejs');

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb){
  User.findOne({id}, function(err, user) {
    cb(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'username',
  passportField: 'password'
  }, function(username, password, cb){
  // the username is always lowercase
  User.findOne({username: username.toLowerCase()}).exec(function(err, user){
      if(err) return cb(err);

      if(!user) return cb(null, false, {message: sails.__('username_not_found')});

      bcrypt.compare(password, user.password, function(err, res){
            if(!res) return cb(null, false, {message: sails.__('invalid_password')} 
      );

      let userDetails = {
              email: user.email,
              username: user.username,
              id: user.id
          };

      return cb(null, userDetails, { message: sails.__('login_success')});
    });
  });
}));