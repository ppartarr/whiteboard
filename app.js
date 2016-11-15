
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


var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


// Setup Routes
app.get('/', routes.index);
app.get('/users', user.list);

app.post('/users',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/users',
                                   failureFlash: true })
);

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
  },
  function(username, password, done) {
    // ...
  }
));

// Enable Socket.io
var server = http.createServer(app).listen( app.get('port') );
var io = require('socket.io').listen( server );


// Disable messages
//io.set('log level', 1);

io.sockets.on('connection', function (socket) {
//  socket.on('ping', function ( data ) {
//    io.sockets.emit( 'pong', data );
//  });
//
//  socket.on( 'drawCircle', function( data, session ) {
//    console.log( "session " + session + " drew:");
//    console.log( "YAY A CIRCLE" );
//    socket.broadcast.emit( 'drawCircle', data );
//  });

  socket.on( 'mousemove', function( data, session ) {
      socket.broadcast.emit( 'moving', data );
    });

});
