$(function(){

    // Configuration
    var url = 'http://localhost'; // URL of your webserver
    var line_thickness = 7;

    // Variables
    var canvas = $('#draw');
    var ctx = canvas[0].getContext('2d');
    var id = Math.round($.now() * Math.random()); // Generate a unique ID
    var drawing = false; // A flag for drawing activity
    var clients = {};
    var cursors = {};
    var prev = {}; // Previous coordinates container
    var socket = io();
    var lastEmit = $.now();
    var firstPoint = false;
    var erase = false;

    /*$('#thickness').slider({
    	formatter: function(value) {
    		return 'Current value: ' + line_thickness;
    	}
    });*/

    function clear(){
	canvas[0].getContext('2d').clearRect(0,0,canvas[0].width,canvas[0].height);
	socket.emit('clear');
    }
    // Drawing helper function=
    function drawLine(fromx, fromy, tox, toy, color, thickness, erase){
	//var erase = globals.erase;
        if (erase){
          ctx.lineWidth = thickness;
          ctx.strokeStyle = "white";
        }
        else{
          ctx.lineWidth = thickness;
          ctx.strokeStyle = color;
          //ctx.strokeStyle = document.getElementById("colorPicker").value;
        }
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }



    // On mouse down
    canvas.on('mousedown', function(e) {
	if(e.which == 1){
        	e.preventDefault();
        	drawing = true;
        	canoffset = $(canvas).offset();
        	prev.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        	prev.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
                e.pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
                e.pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
            socket.emit('mousemove', {
                'x': e.pageX,
                'y': e.pageY,
                'drawing': false,
                'id': id,
                'color': document.getElementById("colorPicker").value,
                'thickness': document.getElementById("thickness").value,
		'erase': globals.erase,
            });
	}
    });


    // On mouse move
    canvas.on('mousemove', function(e) {
        if (drawing)
        {
            e.pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
            e.pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
            drawLine(prev.x, prev.y, e.pageX, e.pageY, document.getElementById("colorPicker").value, document.getElementById("thickness").value, globals.erase);
            prev.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
            prev.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
        }
        // Emit the event to the server
        if ($.now() - lastEmit > 4)
        {
		if(drawing)
            socket.emit('mousemove', {
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'id': id,
                'color': document.getElementById("colorPicker").value,
                'thickness': document.getElementById("thickness").value,
		'erase': globals.erase,
            });
            lastEmit = $.now();
        }

        // Draw a line for the current user's movement

    });

    // On mouse up
    canvas.on('mouseleave', function(e) {
      drawing = false;
    });
    canvas.on('mouseup', function(e){
      socket.emit('actionOver');
      drawing = false;
    });

    // Keep users screen up to date with other users cursors & lines
    socket.on('moving', function(data){
      processData(data);
    });


    socket.on('loadInitial', function(data){
    canvas[0].getContext('2d').clearRect(0,0,canvas[0].width,canvas[0].height);
        var converted;
        if(data.x.length>0){
	  firstPoint = true;
            for(var i = 0; i<data.x.length ; ++i){
                if( data.blank[i] == true){
		            firstPoint = true;
                    continue;
 		        }
                converted = {
                        x:data.x[i],
                        y:data.y[i],
                        id:data.id[i],
                        drawing:data.drawing[i],
                        color:data.color[i],
                        thickness:data.thickness[i],
                        erase:data.erase[i],
            }
                processData(converted);
            }
        }
    });

    download.addEventListener("click", function() {
        var canvas = document.getElementById("draw");
          var imgData = canvas.toDataURL();
          var pdf = new jsPDF();
          pdf.addImage(imgData, 'JPEG', 0, 0);
          var download = document.getElementById('download');

          pdf.save("download.pdf");
    });

    $('#redo').on("click", function(){
    socket.emit('redo request');502

    return false;
    });

    $('#undo').on("click", function(){
    socket.emit('undo request');
    return false;
    });

    $('#clear').on("click", function(){
    clear();
    return false;
    });


function processData(data) {
//         Create cursor
        if ( !(data.id in clients) )
        {
            cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
        }

        // Move cursor
        cursors[data.id].css({
            'left' : data.x,
            'top' : data.y
        });

        // Set the starting point to where the user first touched
        if (data.drawing && clients[data.id] && data.touch)
        {
            clients[data.id].x = data.startX;
            clients[data.id].y = data.startY;
        }

        // Show drawing
        if (data.drawing && clients[data.id])
        {
            // clients[data.id] holds the previous position of this user's mouse pointer
	  if(firstPoint){
	      firstPoint = false;
              console.log(data.y);
              drawLine(data.x, data.y, data.x, data.y, data.color, data.thickness, data.erase);

	  }
	  else{
              drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, data.color, data.thickness, data.erase);
          }
	}

//         Save state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    }

});