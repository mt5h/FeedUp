const bcrypt = require('bcrypt-nodejs');

module.exports = {

  attributes: {
    email: {
      type: 'string',
      required: true,
      unique: true
    },
    username: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      required: true
    },
    avatar:{
      type: 'string',
      required: false,
      defaultsTo: "0.svg"
    }
  },
  customToJSON: function() {
     return _.omit(this, ['password'])
  },

  beforeCreate: function(user, cb){
    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(user.password, salt, null, function(err, hash){
        if(err) return cb(err);
        user.password = hash;
        return cb();
      });
    });
  },

  beforeUpdate: function(user, cb){
    if (user.password){
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(user.password, salt, null, function(err, hash){
          if(err) return cb(err);
          user.password = hash;
          return cb();
        });
      });
    }else{
                return cb();
    }



  },

}
