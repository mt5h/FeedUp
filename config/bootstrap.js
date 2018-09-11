module.exports.bootstrap = async function(done) {
  var user = await User.findOne(
    {email: "test@exmaple.local"}
  );

  if ( user === undefined){

      user = await User.create(
      { username:"test",
        email:"test@exmaple.local",
        password:"test123",
       },
     ).fetch();

  await Feed.createEach([
    { user_id: user.id,
      url:"http://localhost:1337/test/avvisi-unimi",
      title:"Avvisi di Unimi.it",
      description:"Avvisi dell'Università degli Studi di Milano",
      website: "http://www.unimi.it",
      refresh:600,
      category:"education",
      favorite: true
    },
    { user_id: user.id,
      url:"http://localhost:1337/test/bbc-u",  // a k is missing on purpose
      title:"BBC News - UK",
      description:"BBC News - UK",
      website: "https://www.bbc.co.uk/news/",
      refresh:60,
      category:"news",
      favorite: true
    },
    { user_id: user.id,
      url:"http://localhost:1337/test/hnrss",
      title:"Hacker News: Front Page",
      description:"Hacker News RSS",
      website: "https://news.ycombinator.com/",
      refresh:600,
      category:"tech",
      favorite: true
    },
    { user_id: user.id,
      url:"http://localhost:1337/test/hwup",
      title:"Le news di Hardware Upgrade",
      description:"Tutti i contenuti di Hardware Upgrade sulla tecnologia - https://www.hwupgrade.it",
      website: "https://www.hwupgrade.it/",
      refresh:600,
      category:"tech",
      favorite: true
    }
  ])
  }




  return done();

};
