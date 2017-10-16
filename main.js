var config = require('./config.js');
var fs = require('fs');
var https = require('https');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');


var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/www'));


var server;
startServer();


function startServer(){
	port = config.port;
	app.listen(port);
	console.log('Listening at http://localhost:' + port)
}


