const FeedToJson = require('../libs/rss.js').load;
var ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const mongo_url = 'mongodb://localhost:27017/feedup';

// Database Name
const dbName = 'feedup';

module.exports = {

 	create: function(req,res){

		var category = req.body.category;
		if (category === "" || category === null){
			category = 'misc';
		}

		var refresh = req.body.refresh * 60;

		data = {
			user_id: req.user.id,
			url: req.body.url,
			title: req.body.title,
			website: req.body.website,
			description: req.body.description,
			category: category,
			favorite: req.body.favorite,
			refresh: refresh
		}

		Feed.create(data).exec(function(err){
			if(err){
				console.log(JSON.stringify(err));
				return res.status(500).json({error: err, message: sails.__('feed_create_fail')});
			}
			return res.status(200).json({message:  sails.__('feed_create_success')});
		})
	},

	show: function(req,res){
		Feed.find({user_id: req.user.id}).exec(function(err, feeds){
			if(err){
				return res.status(500).send({error: 'Database Error', message: sails.__('feed_show_fail')});
			}
			return res.view('feed/show', {feeds, layout: null });
		})
	},
	delete: function(req,res){
		var feed_id = req.body.id;
		var user_id = req.user.id;
		Feed.destroy({id:feed_id, user_id: user_id}).exec(function(err){
			if(err){
				return res.status(500).send({error: err, message: sails.__('feed_delete_fail')});
			}
			return res.status(200).json({message:  sails.__('feed_delete_success')});
		})
	},
	update: function(req,res){
		user = {
			id: req.body.id,
			user_id: req.user.id
		}

		var category = req.body.category;
		if (category === "" || category === null){
			category = 'misc';
		}

		var refresh = req.body.refresh * 60;

		feed = {
			url: req.body.url,
			title: req.body.title,
			website: req.body.website,
			description: req.body.description,
			category: category,
			favorite: req.body.favorite,
			refresh: refresh,
			lastcheck: 0
		}
		Feed.update(user,feed).exec(function(err){
						if(err){
							return res.status(500).send({error: err, message: sails.__('operation_failed')});
						}
					});
					return res.status(200).json({message: sails.__('feed_update_success')});
	},
	edit: function(req,res){
		user = {
			id: req.param('id'),
			user_id: req.user.id
		}

		Feed.findOne(user).exec(function(err, feed){
			if(err){
				return res.status(500).send({error: err, message: sails.__('operation_failed')});
			}
			return res.status(200).json(feed);
		});
	},

	query: function(req,res){
		requested_feed = {
			id: req.param('id'),
			user_id: req.user.id
		}

    Feed.findOne(requested_feed).then(function (channel){
      if (channel.error === true){
        throw channel.error_message;
      }
      var sorted_rss = channel.items.sort(function(a, b) {
        return new Date(b.pubDate) - new Date(a.pubDate);
      });
      return sorted_rss
    }).then(function(data){
      return res.view('feed/detail',{
        rss: data,
        rss_id: requested_feed.id,
        locale: req.getLocale(),
        layout: null
      });
    }).catch(function (err) {
      console.log(err);
      return res.status(500).send({'message': sails.__('feed_not_found')});
    });
	},

	check: function(req,res){

    var channel = Object();
  	channel.url = req.body.url;
    FeedToJson(channel).then(function(result){
      return res.status(200).json(
        { 'state': 'success',
          'title':result.title,
          'description': result.description,
          'link': result.link,
          'message': sails.__('feed_check_success')
        })
    }).catch(function (err){
      return res.status(500).send({message: sails.__('feed_check_fail')});
    });

	},

	status: function(req, res){
        var now = new Date;
        var user = {user_id: req.user.id}

        function need_refresh(channel){
          var gap = now - new Date(channel.lastcheck);
          if ( gap > (channel.refresh * 1000)){
            return channel;
          }
        }
      async function handleError(failed){
        await Feed.update(
          {id: failed.id, user_id: req.user.id},
          {"error": true, "error_messge": failed.error_message});
        return null;
      }

      Feed.find(user)
      .then(function (channels){
        var outdates = channels.filter(need_refresh);
        var promises = outdates.map(FeedToJson);
        //var solved = Promise.all(promises.map(p => p.catch(error => null)));
        var solved = Promise.all(promises.map(p => p.catch(error => handleError(error))));
        return solved;
        })
      .then(function(data){
        return data.filter(d => d !== null);
      })
      .then(function(data){
        data.map(async function(feed){
          await Feed.update(
            {id: feed.id, user_id: req.user.id},
            {"lastview": feed.lastview, "lastcheck": feed.lastcheck, "items": feed.items, "error": false});
        });
        return data;
      })
      .then(async function(data){
        var final = await Feed.find(user);
        res.json(final);
      })
      .catch(function (err) {
          console.log(err);
          res.json(err);
      });
	},

	dashboard: function(req,res){
		var filter = Object();
		if( req.param('id') !== undefined){
		// if id is present get that
		// GET http://localhost:1337/feed/dashboard/123
			filter = {id: req.param('id')};
		} else if (req.param('name') !== undefined){
		// if category is present get that
		// GET http://localhost:1337/feed/dashboard/category/123
			filter = {category: req.param('name')};
		} else {
		// if nothing is present get all the favorites
			filter = {favorite: true};
		}
		// filter by user always
		filter.user_id = req.user.id;
		Feed.find(filter).exec(function(err, feeds){
      if (err){
        return res.status(500).send({'message': sails.__('operation_failed')});
      } else {
        return res.view('feed/dashboard',{feeds});
      }

		});

	},

  mark: function(req, res){
    var id = req.body.id;
    var item = req.body.item;

    MongoClient.connect(mongo_url,{ useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      //console.log("Connected successfully to server");
      const db = client.db(dbName);
        // Get the documents collection
        const collection = db.collection('feed');
        collection.findOneAndUpdate(
            {"_id": ObjectId(id), "user_id": req.user.id},
            {$set:{"items.$[el].notification": false}},
            { sort: null, upsert:false, returnNewDocument : false, arrayFilters: [{"el.id": item}] },
            function (err, mess) {
              if(err){
        				return res.status(500).send({'message': sails.__('operation_failed')});
        			} else {
        				return res.status(200).send();
        			}
            }
        );
      client.close();
    });
},

	notification: function(req, res){
		filter = {
			user_id: req.user.id,
		}

		Feed.find(filter).exec(function(err, feeds){
      var notifications = [];
      for (var i = 0; i < feeds.length; i++) {
        var channel_updates = 0;
        for (var j = 0; j < feeds[i].items.length; j++) {
          if (feeds[i].items[j].notification){
            channel_updates += 1;
          }
        }
        if (channel_updates > 0){
          notifications.push({id: feeds[i].id, title: feeds[i].title, updates: channel_updates});
        }
      }

			if(err){
				return res.status(500).send({'message': sails.__('operation_failed')});
			} else {
				return res.view('feed/notifications', {notifications, layout: null});
			}
		});
	},

};
