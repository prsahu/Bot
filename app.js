/*var GoogleSpreadsheet = require('google-spreadsheet');

// spreadsheet key is the long id in the sheets URL 
var doc = new GoogleSpreadsheet('1yvwKdDinme0_Rjs0SvyPmIlO6CJpI5JvlBpeWhyi_uE');
var sheet;

function setAuth() {
    // see notes below for authentication instructions! 
   // var creds = require('client_secret.json');
    // OR, if you cannot save the file locally (like on heroku) 
    var creds_json = {
      client_email: 'prafful.sahu1@gmail.com',
      private_key: process.env.private_key
    }
 
    doc.useServiceAccountAuth(creds_json, readthevalues);
  }

  function readthevalues(){
 doc.getInfo(function(err, info) {
     if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
      console.log('Loaded doc: '+info.title+' by '+info.author.email);
      sheet = info.worksheets[0];
      console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
      
    });

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
*/

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


/*var key = require('client_secret.json');
var jwtClient = new google.auth.JWT('prafful.sahu1@gmail.com', null, key.private_key, [scope1, scope2], null);

jwtClient.authorize(function(err, tokens) {
  if (err) {
    console.log(err);
    return;
  }

  // Make an authorized request to list Drive files.
  drive.files.list({ auth: jwtClient }, function(err, resp) {
    // handle err and response
  });
});*/

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var dishes;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
//  authorize(JSON.parse(content), listMajors);
  /*
  var clientSecret = JSON.parse(content).installed.client_secret;
  var clientId = JSON.parse(content).installed.client_id;
  var redirectUrl = JSON.parse(content).installed.redirect_uris[0];
  var auth = new googleAuth();
/*  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
  oauth2Client.credentials = process.env.GOOGLE_KEY;*/

/*  var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
google.options({ auth: oauth2Client });
  
  console.log(clientSecret);
  console.log(clientId);
  console.log(redirectUrl);
  console.log(process.env.GOOGLE_KEY);
  
  listMajors(oauth2Client);*/
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = process.env.GOOGLE_KEY;//token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}
/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */

//4/7CkdyxOn72iS_mV6L8rtq1l0S0iH602YViUvE5NTSDw