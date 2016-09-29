
var dishes;
function listMajors(){//auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    //auth: auth,
    spreadsheetId: '1yvwKdDinme0_Rjs0SvyPmIlO6CJpI5JvlBpeWhyi_uE',
    range: 'Dishes!A1:A5',
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

var google = require('googleapis');
//=========================================================
// Bots Dialogs
//=========================================================
bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });

bot.dialog('/',
function(session){
  session.replaceDialog('/Welcome');
});

bot.dialog('/Welcome', [
  function (session) {
    session.send("Namaste! Welcome to Indian Kitchen");
    session.send("What can we do for you today?");
    builder.Prompts.choice(session,"Choose One","Place an order|View Menu|Leave Review|(quit)");
  },
  function(session,results){
    if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
    } else {
            // Exit the menu
            session.endDialog();
    }
  },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/Welcome');
    }
]);

bot.dialog('/Place an order',[
  function(session){

  }
]);

bot.dialog('/View Menu',[
  function(session){
    session.send("You can send the user a list of cards as multiple attachments in a single message...");

        var msg = new builder.Message(session)
            .attachments([
                new builder.HeroCard(session)
                    .title("Space Needle")
                    .subtitle("The Space Needle is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ]),
                new builder.HeroCard(session)
                    .title("Pikes Place Market")
                    .subtitle("Pike Place Market is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
            ]);
        session.endDialog(msg);
  }
]);

bot.dialog('/Leave Review',[
  function(session){
    builder.Prompts.text(session, "What company do you work for?");
  },
  function(session,results){
    session.send("Here is your review"+results.response);
  }
]);
