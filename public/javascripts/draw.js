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
    var socket = io.connect(url);
    var lastEmit = $.now();

    function setColour(){
          line_colour = document.getElementById("test").value;
        }

    // Drawing helper function=
    function drawLine(fromx, fromy, tox, toy){
        var check = document.getElementById("erase");
        if (check.checked){
          ctx.lineWidth = 20;
          ctx.strokeStyle = "white";
        }
        else{
          ctx.lineWidth = document.getElementById("thickness").value;
          ctx.strokeStyle = document.getElementById("colorPicker").value;
        }
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }

    // On mouse down
    canvas.on('mousedown', function(e) {
        e.preventDefault();
        drawing = true;
        canoffset = $(canvas).offset();
        prev.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        prev.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
    });


    // On mouse move
    canvas.on('mousemove', function(e) {
        // Emit the event to the server
        if ($.now() - lastEmit > 30)
        {
            socket.emit('mousemove', {
                'x': e.pageX,
                'y': e.pageY,
                'drawing': drawing,
                'id': id
            });
            lastEmit = $.now();
        }

        // Draw a line for the current user's movement
        if (drawing)
        {
            e.pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
            e.pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
            drawLine(prev.x, prev.y, e.pageX, e.pageY);
            prev.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
            prev.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;

        }
    });

    // On mouse up
    canvas.on('mouseup mouseleave', function(e) {
        drawing = false;
    });

    // Keep users screen up to date with other users cursors & lines
    socket.on('moving', function (data) {
        console.log('moving');
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
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        }

//         Save state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    })

    download.addEventListener("click", function() {
        var canvas = document.getElementById("draw");
          var imgData = canvas.toDataURL();
          var pdf = new jsPDF();
          pdf.addImage(imgData, 'JPEG', 0, 0);
          var download = document.getElementById('download');

          pdf.save("download.pdf");
    });

});
