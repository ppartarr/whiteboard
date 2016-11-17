var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);


server.listen(3005);

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var initialCanvas = {
      x: [],
      y: [],
      drawing: [],
      id: [],
      color: [],
      thickness: [],
      erase: [],
};


io.on('connection', function (socket) {
  socket.emit('loadInitial', initialCanvas);
  socket.on( 'mousemove', function( data, session ) {
      initialCanvas.x.push(data.x);
      initialCanvas.y.push(data.y);
      initialCanvas.drawing.push(data.drawing);
      initialCanvas.id.push(data.id);
      initialCanvas.thickness.push(data.thickness);
      initialCanvas.erase.push(data.erase);
      initialCanvas.color.push(data.color);
      socket.broadcast.emit( 'moving', data );
    });
  socket.on('chat message', function(msg){
        io.emit('chat message', msg);
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
