
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
    io.sockets.emit( 'pong', data );
  });

//  socket.on( 'drawCircle', function( data, session ) {
//    console.log( "session " + session + " drew:");
//    console.log( "YAY A CIRCLE" );
//    socket.broadcast.emit( 'drawCircle', data );
//  });

  socket.on( 'onMouseDrag', function( data, session ) {
      console.log( "onMouseDrag is happening");
      socket.broadcast.emit( 'onMouseDrag', data );
    });

});