const request = require('request');
const requestPromise = require('request-promise');
const fastXmlParser = require('fast-xml-parser');
const iconv = require('iconv-lite');
const detectCharacterEncoding = require('detect-character-encoding');
const uuidv4 = require('uuid/v4');

var header_user_agent = 'request';
var header_accept = 'text/html,application/xhtml+xml,text/xml';
var params = {
  uri: "",
  encoding: null,
  headers: {'User-Agent': header_user_agent, 'Accept': header_accept},
  pool: false,
  followRedirect: true
}
const options = {
  attributeNamePrefix : "@_",
  attrNodeName: false,
  textNodeName : "#text",
  ignoreAttributes : true,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  decodeHTMLchar: false,
};

var error_message = {
  'message': sails.__('feed_check_fail'),
  'details': null
}

module.exports = {
  load: function(channel){

    var parseXml = function(xml) {
      return new Promise(function(resolve, reject){
        const charsetMatch = detectCharacterEncoding(xml);
        var utf8String = iconv.decode(Buffer.from(xml), charsetMatch.encoding);
        var xmlData = utf8String;
        var jsonObj = fastXmlParser.parse(xmlData);
        var tObj = fastXmlParser.getTraversalObj(xmlData,options);
        var jsonObj = fastXmlParser.convertToJson(tObj,options);
        var new_lastview = new Date(0);
        var newitems = [];
        var current_lastview = new Date(channel.lastview);

        for (var i = 0; i < jsonObj.rss.channel.item.length; i++) {
          item_date = new Date(jsonObj.rss.channel.item[i].pubDate);
          if (item_date > current_lastview){
            jsonObj.rss.channel.item[i].notification = true;
            jsonObj.rss.channel.item[i].id = uuidv4();
            newitems.push(jsonObj.rss.channel.item[i]);
            if (item_date > new_lastview){
              new_lastview = item_date;

            }
          }
        }

        channel.lastcheck = new Date; // to fulfill refresh interval
        if (new_lastview > current_lastview){
          channel.lastview = new_lastview;
        }
        jsonObj.rss.channel.id = channel.id;
        jsonObj.rss.channel.user_id = channel.user_id;
        jsonObj.rss.channel.url = channel.url;
        jsonObj.rss.channel.refresh = channel.refresh;
        jsonObj.rss.channel.lastview = channel.lastview;
        jsonObj.rss.channel.lastcheck = channel.lastcheck;
        jsonObj.rss.channel.updates = channel.updates;
        if (channel.hasOwnProperty("items")){
          jsonObj.rss.channel.items = channel.items.concat(newitems);
        } else {
          jsonObj.rss.channel.items = newitems;
        }

        delete jsonObj.rss.channel.item;
        resolve(jsonObj.rss.channel);
      }).catch(function(e){
        console.log("Error in " + channel.url + " " + e);
      })
    }

    return new Promise(function(resolve, reject) {
      var uri = channel['url'];
      if (uri === '' || uri == 'undefined'){
        console.log("uri undefined");
      } else {
        params.uri = uri;
      }
      console.log("Checking: " + uri);

    requestPromise(params)
      .then(function (body) {
          resolve(parseXml(body));
      })
      .catch(function (err) {
          channel.error_message = err.message;
          reject(channel);
          // reject(err.message);
      });
    });
}


}
