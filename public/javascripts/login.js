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
    //alert("names: " + names + "\nusername: " + username);
    if (names != null && username != null){
        for (var i=0; i<names.length; i++){
        //alert(typeof username + username + " " + typeof names[i] + names[i]);
            if (username == names[i]){
                //alert("working" + username);
                $('#user').text(username);
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
    if (username == ""){
        alert("Username cannot be empty!");
        return false;
    }
    $('#user').text(username);
    socket.emit('login', username);
    closeNav();
    sessionStorage.setItem("username", username);
    return false;
});