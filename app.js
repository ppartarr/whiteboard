var storedMsgs = [];
var names = [];

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);


server.listen(3000);

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
      blank: [],
};

var undoneCanvas = {
      x: [],
      y: [],
      drawing: [],
      id: [],
      color: [],
      thickness: [],
      erase: [],
      blank: [],
};



io.on('connection', function (socket) {
  socket.emit('loadInitial', initialCanvas);
  socket.emit('loadChat', storedMsgs);
  socket.on( 'mousemove', function( data, session ) {
      initialCanvas.x.push(data.x);
      initialCanvas.y.push(data.y);
      initialCanvas.drawing.push(data.drawing);
      initialCanvas.id.push(data.id);
      initialCanvas.thickness.push(data.thickness);
      initialCanvas.erase.push(data.erase);
      initialCanvas.color.push(data.color);
      initialCanvas.blank.push(false);
      socket.broadcast.emit( 'moving', data );
    });
  socket.on('actionOver', function(){
      initialCanvas.x.push(" ");
      initialCanvas.y.push(" ");
      initialCanvas.drawing.push(" ");
      initialCanvas.id.push(" ");
      initialCanvas.thickness.push(" ");
      initialCanvas.erase.push(" ");
      initialCanvas.color.push(" ");
      initialCanvas.blank.push(true);
    });
  socket.on('clear', function(){
      undoStack(true, loadCanvas);
  });
  socket.on('undo request', function(){
      undoStack(false, loadCanvas);
  });
  socket.on('redo request', function(){
      redoStack(loadCanvas);
  });
  socket.on('chat message', function(msg){
      storedMsgs.push(msg);
      io.emit('chat message', msg);
  });
    socket.on('login', function(username){
        names.push(username);
        io.emit('logged in', " ", username);
    });
});


loadCanvas = function(){
  io.emit('loadInitial', initialCanvas);
}



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
  console.log(gApi.getName());
  io.emit('name', gApi.getName());
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

//------------------login stuff------------------------------------------

app.get('/login.html', function(req, res){
  res.sendFile(__dirname+'/login.html');
});

io.on('connection', function(socket){
  socket.on('login', function(msg,username){
  });
});

function undoStack(clearAll, callback){
  while(initialCanvas.x.length>0){
	  undoneCanvas.x.push(initialCanvas.x.pop());
          undoneCanvas.y.push(initialCanvas.y.pop());
          undoneCanvas.id.push(initialCanvas.id.pop());
          undoneCanvas.drawing.push(initialCanvas.drawing.pop());
          undoneCanvas.blank.push(initialCanvas.blank.pop());
          undoneCanvas.erase.push(initialCanvas.erase.pop());
          undoneCanvas.thickness.push(initialCanvas.thickness.pop());
          undoneCanvas.color.push(initialCanvas.color.pop());
	  if(undoneCanvas.blank[undoneCanvas.blank.length-1] == true && clearAll==false ) break;
  }
  callback();
}

function redoStack(callback){
  while(undoneCanvas.x.length>0){
          initialCanvas.x.push(undoneCanvas.x.pop());
          initialCanvas.y.push(undoneCanvas.y.pop());
          initialCanvas.id.push(undoneCanvas.id.pop());
          initialCanvas.drawing.push(undoneCanvas.drawing.pop());
          initialCanvas.blank.push(undoneCanvas.blank.pop());
          initialCanvas.erase.push(undoneCanvas.erase.pop());
          initialCanvas.thickness.push(undoneCanvas.thickness.pop());
          initialCanvas.color.push(undoneCanvas.color.pop());
          if(initialCanvas.blank[initialCanvas.blank.length-1] == true) break;
  }
  callback();
}
