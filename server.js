var moment = require('moment');
var mysql = require('mysql');
// var express = require('express');

//--------------------------------------------------------- 应用模块
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var connectionsArray = [];

//---------------------------------------------------------配置模块
var db_set = require('./db_setting');
// ---------------------------------------------------------连接数据库
var connection = mysql.createConnection(db_set.info);

var POLLING_INTERNAL = 1000;
var pollingTimer;

// ---------------------------------------------------------创建一个connection
connection.connect(function(err) {
	if (err) {
		console.log('[query] - :' + err);
		return;
	}
	console.log('[Database connection connect]  succeed!');
});


//--------------------------------------------------------- 启动HTTP服务，绑定端口8080
app.listen(3000);
console.log("[Http server is starting] port is 3000");

// 加载客户端首页
function handler(req, res) {
	//__dirname:   "C:\Leslie\Node_Test\demo_sql"
	fs.readFile(__dirname + '/client.html', function(err, data) {
		if (err) {
			console.log(err);
			res.writeHead(500);
			return res.end('Error when load client index')
		}
		res.writeHead(200);
		res.end(data);
	});
}

/*
  这个就是实现主要功能的方法，间隔3秒去查询数据库表，有更新就推送给客户端
*/

var pollingLoop = function() {
	var query = connection.query('SELECT * FROM wse.wse_people');
	var names = [];
	// 用于保存查询结果
	query.on('error', function(err) {
		console.log(err);
		updateSockets(err);
	}).on('result', function(name) {
		names.push(name);
	}).on('end', function() {
		// 检查是否有客户端连接，有连接就继续查询数据库
		if (connectionsArray.length) {
			pollingTimer = setTimeout(pollingLoop, POLLING_INTERNAL);
			updateSockets({
				names: names
			});
		}
	});
};

// 创建一个websocket连接，实时更新数据
io.sockets.on('connection',function(socket){
	console.log('The connection number of client side is ' + connectionsArray.length);
	// 有客户端连接的时候才去查询，不然都是浪费资源
	if(!connectionsArray.length){
		pollingLoop();
	}

	socket.on('disconnect',function(){
		var socketIndex = connectionsArray.indexOf(socket);
		console.log('socket = ' + socketIndex + ' disconnected.');

		if(socketIndex >= 0){
			connectionsArray.splice(socketIndex,1);
		}
	});

	console.log('There is new client connection');

	connectionsArray.push(socket);
});

var updateSockets = function(data){
	// 加上最新的更新时间
	data.time = moment().format('MMMM Do YYYY, h:mm:ss');

	// 推送最新的更新信息到所以连接到服务器的客户端
	connectionsArray.forEach(function(tpmSocket){
		tpmSocket.volatile.emit('notification',data);
	});
};