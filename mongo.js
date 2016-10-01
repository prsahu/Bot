var dataBase;
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
 
// Connection URL 
var url = process.env.MongoDBURL;
// Use connect method to connect to the Server 
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server"); 
  dataBase = db;
});

function ConnectToDB(){
    MongoClient.connect(url,ConnectCallback);
}

function ConnectCallback(err,db){
    assert.equal(null, err);
    console.log("Connected correctly to server"); 
    dataBase = db;
}

var insertDocuments = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('orders');
  // Insert some documents 
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the document collection");
    callback(result);
  });
}

function SaveTheOrder(session){
  var collection = dataBase.collection('orders');  
   dataBase.collection('orders').insertOne( {
      "details" : {
         "name" : session.userData.name,
         "phoneNumber" : session.userData.phoneNumber         
      },
      "order":session.conversationData
   });
}