'use strict';
const server_port = 80

const express = require('express');
const app = express();
const http = require('http').createServer(app);

let game;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/www/index.html');
});
app.use('/', express.static('www'))

http.listen(server_port, function(){
  console.log('listening on localhost:'+server_port);
});
