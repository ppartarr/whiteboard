var username;
var names = [];
var socket = io();

function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

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
    console.log('username' + "is logged in for good");
    names.push(username);
});