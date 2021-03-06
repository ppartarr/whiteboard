
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var HashMap = require('hashmap');



var main = require(__dirname+'/app.js');


var spreadsheets = new HashMap();
var rawSpreadsheets = new HashMap();
var nameIdMap = new HashMap();

var cellLocation;
var cellValue;

var rowLocation;
var row;

this.addRow = function(rowSize){
  row = []
  for(var i = 0; i < rowSize; ++i){
    row.push(" ");
  }
  rowLocation = spreadsheets.get(spreadID).length+1;
  getJSON(fs, addRow);
}
this.addCol = function(rowSize){
  row = []
  for(var i = 0; i < rowSize+1; ++i){
    row.push(" ");
  }
  rowLocation = spreadsheets.get(spreadID).length;
  getJSON(fs, addRow);
}

this.updateCell = function(value, address){
  cellLocation = String.fromCharCode(65+parseInt(address[1], 10))+(++address[0]);
  cellValue = value;
  getJSON(fs, updateCell);
}

this.getRawSheet = function(){
  return rawSpreadsheets.get(spreadID);
}
this.getList = function(){
  return nameIdMap.get('tsvetan');
}
this.getSheet = function(){
  return spreadsheets.get(spreadID);
}
this.getName = function(){
  headers = nameIdMap.get('tsvetan');
  for(var i=0; i<headers.length; ++i){
    if(headers[i].id == spreadID) return headers[i].name;
  }
}
var spreadID = '1MFnKLbaG1ZKDtIOZu-S_xa03v-5kjDiJ10KCjxe4mwE';
this.loadSheet = function(id){
  if(id){
    spreadID = id;
  }
  getJSON(fs, loadS);
}

this.listSheet = function(){
  getJSON(fs, listS);
}
	

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly',
'https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
// Load client secrets from a local file.


function getJSON(fs, callback){
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), callback);
  });
}

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
    access_type: 'offline',
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
      oauth2Client.credentials = token;
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
function loadS(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: spreadID,
    range: 'Sheet1',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      spreadsheets.set(spreadID, rows);
      loadRawS(auth);
      main.newSheet();
      }
  })};
function loadRawS(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: spreadID,
    range: 'Sheet1',
    valueRenderOption: "FORMULA",
}, function(err, response){
    if(err){
      console.log("Error" + err);
      return;
    }
    var rows = response.values;
    if(rows.length == 0){
      console.log("No data found");
    } else{
      rawSpreadsheets.set(spreadID, rows); 
      main.newRawSheet();
    }
})};


function addRow(auth){
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
  auth: auth,
  spreadsheetId: spreadID,
  range: 'Sheet1!'+rowLocation+':'+rowLocation,
  resource: {
    range: 'Sheet1!'+rowLocation+':'+rowLocation,
    values: [row],
  },
  valueInputOption: "USER_ENTERED",
}, function(err, response){
    if(err){
      console.log("Error" + err);
      return;
    }
    loadS(auth);
})};


function updateCell(auth){
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
  auth: auth,
  spreadsheetId: spreadID,
  range: 'Sheet1!'+cellLocation,
  resource: {
    range: 'Sheet1!'+cellLocation,
    values: [[cellValue]],
  },
  valueInputOption: "USER_ENTERED",
}, function(err, response){
    if(err){
      console.log("Error" + err);
      return;
    }
    loadS(auth);
})};
function listS(auth) {
  var drive = google.drive({version: 'v3', auth: auth});
  drive.files.list({}, function(err, response){
    if(err){
      console.log(err);
      return;
    }
    var list = response;
    nameIdMap.set("tsvetan", list.files);
    main.list();
  });
};

function uploadToDrive(auth, data){
  var drive = google.drive({ version: 'v3', auth: auth});
  drive.files.create({
    resource: {
    name: 'Test',
    mimeType:'application/vnd.google-apps.spreadsheet'
  },
  media:{
    mimeType:'application/vnd.google-apps.spreadsheet',
    body: ''
  }
});
}
