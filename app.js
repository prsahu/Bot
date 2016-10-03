
var dishes=[];
var description=[];
var imageUrls;
var tempDish="";
var sheets = require('./sheetsapi.js');

function listMajors(){//auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    //auth: auth,
    spreadsheetId: process.env.spreadsheetId,
    range: 'Dishes!A1:A5',
    key : process.env.private_key

  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    //console.log(response);

    dishes = response.values;

  });

  sheets.spreadsheets.values.get({
    //auth: auth,
    spreadsheetId: process.env.spreadsheetId,
    range: 'Dishes!B1:B5',
    key : process.env.private_key

  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    //console.log(response);

    description = response.values;

  });

  /*sheets.spreadsheets.values.get({
    //auth: auth,
    spreadsheetId: process.env.spreadsheetId,
    range: 'Dishes!C1:C5',
    key : process.env.private_key

  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    //console.log(response);

    imageUrls = response.values;

  });*/
}

var restify = require('restify');
var builder = require('botbuilder');

function CreateMenuCardsForOrder(session){
  var cardsForOrder=[];
  for (var i = 0; i < dishes.length; i++) {
    var tempCard = new builder.HeroCard(session)
        .title(dishes[i])
        .subtitle(description[i])
        .images([
            builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
        ])
        .buttons([
            builder.CardAction.imBack(session,dishes[i].toString(), "Select")
        ]);
    cardsForOrder.push(tempCard);
  }
  return cardsForOrder;
}

function CreateMenuCardsForView(session){
  var cardsForViewing=[];
  for (var i = 0; i < dishes.length; i++) {
    var tempCard2 = new builder.HeroCard(session)
        .title(dishes[i])
        .subtitle(description[i])
        .images([
            builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
        ]);
    cardsForViewing.push(tempCard2);
  }
  return cardsForViewing;
}

function CreateReceipt(session){
  var receiptItems = [];
  for(var key in session.conversationData){        
        if(session.conversationData[key]){
          var tp = new builder.ReceiptItem.create(session, key, session.conversationData[key]);
          receiptItems.push(tp);
        }
  }
  var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Recipient's Name")
                    .items([
                        receiptItems
                    ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method")
                    ])
                    .total("$48.40")
            ]);
  return msg;
}
 
//=========================================================
// Bot Setup
//=========================================================
var mongo = require('./mongo.js');
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
   mongo.ConnectToDB();
   //setAuth();
   //listMajors();
   sheets.setAuth();
   //sheets.CallAsync();
   dishes = sheets.dishes;
   description = sheets.description;
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector, { persistConversationData: true });
server.post('/api/messages', connector.listen());

var google = require('googleapis');

//=========================================================
// Bots Dialogs
//=========================================================
bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });

bot.dialog('/',
function(session){
  session.conversationData = {};
  session.replaceDialog('/Welcome');
});

bot.dialog('/Welcome', [
  function (session) {
    session.sendTyping();
    session.send("Namaste! Welcome to Indian Kitchen");
    session.sendTyping();
    session.send("What can we do for you today?");
    session.sendTyping();
    builder.Prompts.choice(session,"Choose One","Place an order|View Menu|Leave Review|My Details|(quit)");
    //console.log(typeof session.conversationData);
   session.conversationData = {};
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
    session.sendTyping();
    dishes = sheets.GiveDishes();
   description = sheets.GiveDescription();
   
    session.send("Here is the menu: ");
    var msg = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(CreateMenuCardsForOrder(session));
      //  console.console.log(dishes.join("|"));
    builder.Prompts.choice(session, msg, dishes.join("|"));
  },
  function (session,results) {
    var action, item;
        item = results.response.entity;
        session.send('You selected %s ', item);        
        tempDish = item;
        builder.Prompts.number(session, "Please enter quantity you would like to order eg:1,2,10,etc.");        
    },
    function (session,results){
      session.send("You chose '%s'", results.response);      
      
      if(session.conversationData[tempDish]!=null){
        session.conversationData[tempDish]= session.conversationData[tempDish]+ results.response;
      }else{
        session.conversationData[tempDish]=results.response;
        //console.log(session.conversationData);
      }
      
      builder.Prompts.choice(session,"Would you like to add something more?","Yes|No");
    },
    function (session,results){
      if(results.response.entity=="Yes"){
        session.beginDialog('/Place an order');
      }else{
        session.replaceDialog('/Order Confirmation');
      }
    }
]);

bot.dialog('/View Menu',[
  function(session){
    session.send("Here is the menu: ");
    var msg = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(CreateMenuCardsForView(session));
    builder.Prompts.choice(session, msg);// "select:100|select:101|select:102");
    session.endDialog();
  }
]);

bot.dialog('/Leave Review',[
  function(session){
    session.sendTyping();
    builder.Prompts.text(session, "Please type in your review and send.");
  },
  function(session,results){
    session.send("Here is your review "+results.response);
    session.replaceDialog('/Welcome');
  }
]);

bot.dialog('/Order Confirmation',[
  function(session){
    if(session.userData.contactDetails!=null&&session.userData.contactDetails==true){
      var temp="Here is your order:";
      
      for(var key in session.conversationData){        
        if(session.conversationData[key]){
          console.log(session.conversationData[key].toString());
          temp += "\n"+ session.conversationData[key];
        }
      }
      session.send(CreateReceipt);
      session.send("Thanks you for your order again %s",session.userData.name);
      //console.log("End");
      mongo.SaveTheOrder(session);
      sheets.WriteOrder(session);
      session.endConversation("");
    }else{
      session.replaceDialog('/User Information');
    }    
  }
]);

bot.dialog('/User Information',[
  function(session){
    //builder.Prompts.confirm(session, "Are you a returning foodie?. Answer yes or no now.");
    builder.Prompts.text(session,"What is your name?");
  }/*,
  function (session, results) {
    if(results.response){
      session.send("I am afraid I have a bad memory");
      session.sendTyping();
      session.send("So you will have to share the details again");      
      builder.Prompts.text(session,"What is your name?");
    }else{
      builder.Prompts.text(session,"What is your name?");
    }
  }*/,
  function(session,results){
    session.userData.name= results.response;
    var temp = "Hi "+results.response+"! Can I have your phone number also??";
    builder.Prompts.number(session,temp);//,results.response);
  },
  function (session,results){
    session.userData.phoneNumber = results.response;
    session.userData.contactDetails = true;
    session.replaceDialog('/Order Confirmation');
    //session.endConversation("");
  }
]);

bot.dialog('/My Details',[
  function(session){
    session.send("Your name is %s",session.userData.name);
    session.send("Your phoneNumber is "+session.userData.phoneNumber.toString());
    session.endConversation("");
  }
]);