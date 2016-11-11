

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var gApi = require(__dirname+'/gApi.js');


this.list = function(){
  io.emit('list', gApi.getList());
}
this.newSheet = function(){
  io.emit('message', gApi.getSheet());
};
this.newRawSheet = function(){
  io.emit('rawsheet', gApi.getRawSheet());
};

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

http.listen(3000, function(){
  console.log('server running');
});
io.on('connection', function(socket){
  socket.on('message', function(msg){
    gApi.loadSheet(); 
  });
  socket.on('list', function(msg){
    gApi.listSheet();
  });
  socket.on('change_to_id', function(msg){
    gApi.loadSheet(msg);
  });
  socket.on('update', function(value, address){
    gApi.updateCell(value, address);
  });
});



