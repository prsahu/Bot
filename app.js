
function listMajors(){//auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    //auth: auth,
    spreadsheetId: '1yvwKdDinme0_Rjs0SvyPmIlO6CJpI5JvlBpeWhyi_uE',
    range: 'Dishes!A1:A5',
    field: sheets,
    key : process.env.private_key

  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log(response);
    var rows = response.values;
    dishes = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      console.log('Name, Major:');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s', row[0]);
      }
    }
  });
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
   //setAuth();
   listMajors();
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

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
