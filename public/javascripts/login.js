var username = "";
var socket = io();

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

function isloggedin() {
    socket.emit('getnames');
    username = sessionStorage.getItem("username");
    names = sessionStorage.getObject("names");
    if (names != null && username != null){
        for (var i=0; i<names.length; i++){
            if (username == names[i]){
                $('#user').text(username);
                $('#close').css('visibility', 'visible');
                return false;
            }
        }
    }
    openNav();
}

socket.on('returnnames', function(names){
    sessionStorage.setObject("names", names);
});

$('#form_name').submit(function(){
    username = $('#username').val();
    names = sessionStorage.getObject("names");
    if (username == ""){
        $("#error").text("Username cannot be empty");
        return false;
    }
    if(names != null){
        for (var i=0; i<names.length; i++){
            if (username == names[i]){
                $("#error").text("Username is already taken");
                return false;
            }
        }
    }
    $('#close').css('visibility', 'visible');
    $("#error").text('');
    $('#user').text(username);
    socket.emit('login', username);
    closeNav();
    sessionStorage.setItem("username", username);
    return false;
});