const passport = require('passport');
const default_view = '/feed/dashboard';

const avatarFolder = process.cwd() + '/assets/images/avatars';
const fs = require('fs');



module.exports = {
  login: function(req, res) {
    passport.authenticate('local', function(err, user, info){
      if ((err) || (!user)) {
          req.addFlash('error', info.message);
          return res.redirect('/login');
      }

      req.logIn(user, function(err){
        if (err) {
          req.addFlash('error', sails.__('login_fail'));
          res.redirect('/login');
        }
        req.addFlash('notification', info.message);
        return res.redirect(default_view);
      });
    })(req, res);
  },

  register: function(req, res){

    data = {
      username: req.body.username.toLowerCase(),
      email: req.body.email,
      password: req.body.password,
      avatar: req.body.avatar
    }

    if (data.password !== req.body.password_check){
        req.addFlash('error', "Passwords don't match");
        delete data.password;
        return res.view('user/register',data);
    }

    User.create(data).fetch().exec(function(err, user){
      if(err){
        // console.log(JSON.stringify(err));
        var message = "";
        if (err.code === "E_UNIQUE"){
          message = "Username already taken";
        } else if (err.code === "E_INVALID_NEW_RECORD"){
          message = "All fields are required";
        } else {
          message = err.details;
        }
        req.addFlash('error', message);
        return res.redirect('/register'); 
      };
      req.logIn(user, function(err){
      if(err){
        req.addFlash('error', err.message);
        return res.redirect('/register'); 
      };
        req.addFlash('notification', sails.__('registration_success'));        
        sails.log('User '+ user.id + ' has logged in');
        return res.redirect(default_view);
      })
    });
  },

  update: function(req, res){
    data = {
      username: req.body.username.toLowerCase(),
      email: req.body.email,
      password: req.body.password,
      avatar: req.body.avatar
    }

    if (data.password !== req.body.password_check && data.password !== ""){
        req.addFlash('error', "Passwords don't match");
        delete data.password;
        return res.redirect('/myprofile');
    }

    if (data.password === ""){
      delete data.password;
    }

    // console.log(JSON.stringify(data));

    User.update({id: req.user.id}).set(data).exec(function(err,user){
      if(err){
        req.addFlash('error', err.details);
        return res.redirect('/myprofile'); 
      }
      req.addFlash('notification', sails.__('profile_updated'));
      return res.redirect(default_view);
    });
  },

  // logout
  logout: function(req,res){
    req.addFlash('notification', sails.__('logout_success'));
    req.logout();
    return res.redirect('/');
  },

  edit: function(req,res){

    var avatars_list = [];
    fs.readdirSync(avatarFolder).forEach(file => {
      avatars_list.push(file);
    });

    User.findOne({id: req.user.id}).exec(function(err, user){
      if(err){
        return res.status(500).send({error: err});
      }
      return res.view('user/edit', {user, avatars: avatars_list});
    });
  },

  status: function(req,res){
    if(req.isAuthenticated()){
          user_data = req.user;
          user_data.authenticated = true;
          username = user_data.username;
          user_data.username =  sails.__('greetings') + " " + username.charAt(0).toUpperCase() + username.slice(1);
          res.status(200).json(user_data);
      } else {
        return res.status(200).json({authenticated: false});
      }
  }
};