
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
    session.send("Here is the menu: ");
    var attachments={};
    for (var i = 0; i < dishes.length; i++) {
      var tempCard = new builder.HeroCard(session)
          .title(dishes[i])
          .subtitle(dishes[i])
          .images([
              builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                  .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
          ])
          .buttons([
              builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
              builder.CardAction.imBack(session, "select:100", "Select")
          ]);
      attachments.push(tempCard);
    }
    var msg = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(attachments);
    builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
  }
]);

bot.dialog('/Leave Review',[
  function(session){
    builder.Prompts.text(session, "Please type in your review and send.");
  },
  function(session,results){
    session.send("Here is your review "+results.response);
    session.replaceDialog('/Welcome');
  }
]);
