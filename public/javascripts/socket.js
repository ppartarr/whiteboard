// Connect to the nodeJs Server
io = io.connect('/');

//console.log( "socket: browser says ping (1)" )
io.emit('ping', { some: 'data' } );

// (4): When the browser recieves a pong event
// console log a message and the events data
io.on('pong', function (data) {
	//console.log( 'socket: server said pong (4)', data );
});