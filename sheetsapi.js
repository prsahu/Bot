var GoogleSpreadsheet = require('google-spreadsheet');
// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(process.env.spreadsheetId);
var sheet,sheetOrders;

exports.setAuth=function() {    
    var creds_json = {
      client_email: process.env.client_email,
      private_key: process.env.GOOGLE_PRIVATE_KEY
    }

    doc.useServiceAccountAuth(creds_json,LoadTheSheet);
}

function LoadTheSheet(){
    doc.getInfo(PopulateData);
}

var dishes=[];
var description=[];
var imageUrls = [];

var app = require('./app.js');

function PopulateData(err,info){
    if(err){
      console.log('The error is '+err);
      return;
    }
      console.log('Loaded doc: '+info.title+' by '+info.author.email);
      sheet = info.worksheets[0];
      sheetOrders = info.worksheets[2];
      console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
      sheet.getCells({
      'min-row': 1,
      'max-row': 5,
      'min-col': 1,
      'max-col': 3,
      'return-empty': true
    },function(err,cells){
        if(err){
            console.log('The error is '+err);
            return;
        }
        var j=0;        
        var i = 0;
        while(j<cells.length){
            dishes[i] = cells[j].value;
            j++;            
            //console.log(j);
            description[i] = cells[j].value;
            //console.log("Mid "+cells[j].value);
            j++;
            imageUrls[i] = cells[j].value;
            j++;
            //console.log("End "+cells[j].value);
            i++;
        }       
        //app.dishes = dishes;
        //app.description = description;
        //console.log("dishes");
    });
}

exports.WriteOrder = function(session){
    for(var key in session.conversationData){        
        if(session.conversationData[key]){
        doc.addRow(2, 
        {
            'name':session.userData.name,
            'number':session.userData.phoneNumber,
            'dish':key,
            'quantity':session.conversationData[key]
        },
        WriteCompletion);
        }
    }    
}

function WriteCompletion(err,response){
    if(err){
            console.log('The error in writing is '+err);
            return;
        }
}


exports.GiveDishes = function(){
    return dishes;
}

exports.GiveDescription = function(){
    return description;
}

exports.GiveImages = function(){
    return imageUrls;
}