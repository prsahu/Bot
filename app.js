var GoogleSpreadsheet = require('google-spreadsheet');

// spreadsheet key is the long id in the sheets URL 
var doc = new GoogleSpreadsheet('1yvwKdDinme0_Rjs0SvyPmIlO6CJpI5JvlBpeWhyi_uE');
var sheet;

function setAuth() {
    // see notes below for authentication instructions! 
    var creds = require('client_secret.json');
    // OR, if you cannot save the file locally (like on heroku) 
    var creds_json = {
      client_email: 'prafful.sahu1@gmail.com',
      private_key: process.env.private_key
    }
 
    doc.useServiceAccountAuth(creds_json, readthevalues);
  }

  function readthevalues(){
      sheet.getCells({
'worksheet_id':0,
'min-row':1,
'max-row':4,
'min-col':1,
'max-col':1,
'return-empty':true
      },callbackCells);
  }

  function callbackCells(err,cells){
      var cell = cells[0];
      console.log('Cell R'+cell.row+'C'+cell.col+' = '+cells.value);
  }




var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
   setAuth();
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    session.send("Hello World");
    for (var i = 0; i < dishes.length; i++) {
        session.send(dishes[i]);
    }
});


