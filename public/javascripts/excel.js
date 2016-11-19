var sheetName;
var rawsheet;
var currentCell;
var rowLength;
var maxRows;
var socket = io();

$('#col').submit(function(){
console.log("col");
socket.emit("col", rowLength);
return false;
});
$('#row').submit(function(){
console.log("row");
socket.emit('row', rowLength);
return false;
});
$('#load').submit(function(){
socket.emit('update', $('#m').val(), currentCell);
return false;
});
$('#list').submit(function(){
alert("asd");
socket.emit('list','list' );
return false;
});
socket.on('message',function(msg){
var tb;
var tr;
var row;
$('#spreadsheet').html("") ;
rowLength = 0;
maxRows = msg.length;
for(var i =0; i<msg.length;++i){
  if(rowLength < msg[i].length) rowLength = msg[i].length;
}
for (var i = 0; i < msg.length; ++i){
  tr = $('<tr>');
  row = msg[i];
  for(var j = 0; j < rowLength; ++j){
    if(j > (row.length-1)){
      row[j] = "";
    }
    tr.append("<td><input id="+String(i)+'-'+String(j)+" value="+row[j]+"></td>");
  }
  tr.append("</tr>");
  $('#spreadsheet').append(tr);
}
$('#spreadsheet > tbody > tr > td > input').on("click", function(){
  $('#m').focus();
  currentCell = $(this).attr('id').split("-");
  $('#m').val(rawsheet[currentCell[0]][currentCell[1]]);
});
});
socket.on('rawsheet', function(msg){
rawsheet = msg;
});
socket.on('name', function(msg){
sheetName = msg;
$('#welcome').html("This is sheet: "+ msg);
});
socket.on('list', function(msg){
var li;
$('#files_list').html("");
for(var i = 0; i < msg.length; ++i){
  li = $('<li class = \"list-group-item list-group-item-action\" >');
  li.append("<button class=\"btn btn-default\" id="+msg[i].id+'>'+msg[i].name+'</button>');
  li.append("</li>");
  $('#files_list').append(li);
}
$('#files_list > li > button').on( "click", function(){
  socket.emit('change_to_id', $(this).attr('id'));
});
});



//printMessage
var printMessage = function(msg){
  $('#messages').append($('<li class="list-group-item">').text(msg));
  $('#messages').scrollTop($('#messages')[0].scrollHeight);
};
  socket.on('loadChat', function(storedMsgs){
      for (var message in storedMsgs) {
          printMessage(storedMsgs[message]);
      }
  });
  $("#chatBox").click(function(){
      $("#chat").toggle();
  });
  $('#chat > form').submit(function(){
      socket.emit('chat message', $('#m2').val());
      $('#m2').val('');
      return false;
  });
  socket.on('chat message', function(msg){
      printMessage(msg);
  });


