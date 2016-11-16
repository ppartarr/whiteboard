var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);


server.listen(3000);

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('connected');
  socket.on( 'mousemove', function( data, session ) {
      socket.broadcast.emit( 'moving', data );
    });

});



// ----------------- Excel Stuff ----------------------------


// google api vars
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


var gApi = require(__dirname+'/gApi.js');


this.list = function(){
  io.emit('list', gApi.getList());
  console.log("entered list");
}
this.newSheet = function(){
  io.emit('message', gApi.getSheet());
};
this.newRawSheet = function(){
  io.emit('rawsheet', gApi.getRawSheet());
};

app.get('/excel.html', function(req, res){
  res.sendFile(__dirname+'/excel.html');
});

server.listen(3000);

io.on('connection', function(socket){
  socket.on('message', function(msg){
    gApi.loadSheet(); 
  });
  socket.on('row', function(msg){
    gApi.addRow(msg);
  });
  socket.on('col', function(msg){
    gApi.addCol(msg);
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
