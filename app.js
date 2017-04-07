var http = require('http');
var https = require('https');
var fs = require('fs');

var sslOptions = {
  key: fs.readFileSync('ssl/private.pem'),
  cert: fs.readFileSync('ssl/file.crt')
}

var server = https.createServer(sslOptions);
//var server = http.createServer();

var io = require('socket.io')(server);
var clientList = {};

io.on('connection', function(client){
	console.log("socket connect", client.id);
	io.emit("broadcast", {
		'login': client.id
	});
	io.emit("newPeer", {
		"id" : client.id
	});
	clientList[client.id] = client;
	client.on('event', function(data){
		console.log("event", data);
		
	});
	client.on('message', function(data){
		console.log("message", data);
		
	});
	client.on('msg', function(data){
		console.log("msg", data);
		if(data.toId) {
			if(clientList[data.toId] !== undefined){
				data.fromId = data.toId;
				delete data.toId;
				clientList[data.fromId].emit("msg", data);
			}
		}
	});

	client.on('rtcmsg', function(data){
		console.log("rtcmsg", data);
		io.emit("rtcmsg", data);
	});

	client.on('disconnect', function(){
		delete clientList[client.id];
		io.emit("broadcast", {
			'logout': client.id
		});
		console.log("socket disconnect");
	});
});
server.listen(3000);
