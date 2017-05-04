
var express = require('express');


var path = require('path');


var app = express();


var fs = require('fs');

var quiz = require('./quiz');





app.use(express.static(path.join(__dirname,'public')));


var server = require('http').createServer(app).listen(3000, '0.0.0.0');

var io = require('socket.io').listen(server);


io.sockets.on('connection', function (socket) {

    quiz.initGame(io, socket);
});
