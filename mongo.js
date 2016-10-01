var dataBase;
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
 
// Connection URL 
var url = "mongodb://prsahu:qwerASD4@ds047166.mlab.com:47166/indiankitchen";//process.env.MongoDBURL;
// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server"); 
  dataBase = db;
});

exports.ConnectToDB =function(){
    MongoClient.connect(url,ConnectCallback);
}

function ConnectCallback(err,db){
    assert.equal(null, err);
    console.log("Connected correctly to server"); 
    dataBase = db;
}


exports.SaveTheOrder=function(session){
  var collection = dataBase.collection('orders');  
   dataBase.collection('orders').insertOne( {
      "details" : {
         "name" : session.userData.name,
         "phoneNumber" : session.userData.phoneNumber         
      },
      "order":session.conversationData
   });
}