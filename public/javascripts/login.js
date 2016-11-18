var username = "";
var socket = io();

function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

function isloggedin() {
    socket.emit('getnames');
}

socket.on('returnnames', function(names){
    for (name in names){
        if (username == name){
            return;
        }
    }
    openNav();
});

$('#form_name').submit(function(){
    username = $('#username').val();
    if (username == ""){
        alert("Username cannot be empty!");
        return false;
    }
    $('#user').text(username);
    socket.emit('login', username);
    closeNav();
    return false;
});

socket.on('logged in', function(username){
//    console.log(username + " is logged in for good");
});