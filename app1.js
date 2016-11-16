
//var passport = require('passport')
//  , LocalStrategy = require('passport-local').Strategy;

//app.post('/users',
//  passport.authenticate('local', { successRedirect: '/',
//                                   failureRedirect: '/users',
//                                   failureFlash: true })
//);

//passport.use(new LocalStrategy(
//  function(username, password, done) {
//    User.findOne({ username: username }, function(err, user) {
//      if (err) { return done(err); }
//      if (!user) {
//        return done(null, false, { message: 'Incorrect username.' });
//      }
//      if (!user.validPassword(password)) {
//        return done(null, false, { message: 'Incorrect password.' });
//      }
//      return done(null, user);
//    });
//  }
//));

//passport.use(new LocalStrategy({
//    usernameField: 'email',
//    passwordField: 'passwd'
//  },
//  function(username, password, done) {
//    // ...
//  }
//));
//

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

server.listen(3000);


app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


// Disable messages
//io.set('log level', 1);



var initialCanvas = {
      x: [],
      y: [],
      drawing: [],
      id: []
};

io.on('connection', function (socket) {
  console.log("connects");
  socket.emit('loadInitial', initialCanvas);
  socket.on( 'mousemove', function( data, session ) {
    initialCanvas.x.push(data.x);
    initialCanvas.y.push(data.y);
    initialCanvas.drawing.push(data.drawing);
    initialCanvas.id.push(data.id);
    socket.broadcast.emit( 'moving', data );
    });


});
