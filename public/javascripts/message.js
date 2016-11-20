//var socket = io();

socket.on('loadChat', function(storedMsgs){
    for (var message in storedMsgs) {
        printMessage(storedMsgs[message]);
    }
});
$("#chatBox").click(function(){
    $("#chat").toggle();
});

$('#message').submit(function(){
    var message = username + ": " + $('#m').val();
    socket.emit('chat message', message);
    $('#m').val('');
    return false;
});

socket.on('chat message', function(msg){
    printMessage(msg);
});

//printMessage
var printMessage = function(msg){
    $('#messages').append($('<li class="list-group-item">').text(msg));
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
};