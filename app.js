
// Express requires these dependencies
var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path');

var app = express();

// Configure our application
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Configure error handling
app.configure('development', function(){
  app.use(express.errorHandler());
});

// Setup Routes
app.get('/', routes.index);
app.get('/users', user.list);

// Enable Socket.io
var server = http.createServer(app).listen( app.get('port') );
var io = require('socket.io').listen( server );

io.sockets.on('connection', function (socket) {
  socket.on('ping', function ( data ) {
    console.log('socket: server recieves ping (2)');
    io.sockets.emit( 'pong', data );
    console.log('socket: server sends pong to all (3)');

  });

//  socket.on( 'drawCircle', function( data, session ) {
//    console.log( "session " + session + " drew:");
//    console.log( data );
//    socket.broadcast.emit( 'drawCircle', data );
//  });

  socket.on( 'drawLine', function( data, session ) {
      //console.log( "session " + session + " drew:");
      //console.log( data );
      socket.broadcast.emit( 'onMouseDown', data );
    });

});