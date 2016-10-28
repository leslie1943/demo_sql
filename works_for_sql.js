var mysql = require('mysql');
var express = require('express');

//--------------------------------------------------------- 应用模块
var app = express();

//---------------------------------------------------------配置模块
var db_set = require('./db_setting');


// ---------------------------------------------------------连接数据库
var connection = mysql.createConnection(db_set.info);

//---------------------------------------------------------创建一个connection
connection.connect(function(err) {
  if (err) {
    console.log('[query] - :' + err);
    return;
  }
  console.log('[connection connect]  succeed!');
});

// --------------------------------------------------------- 执行SQL语句 1
var arr_people = [];
var sql_query_people = 'SELECT * FROM wse.wse_people';
connection.query(sql_query_people, function(err, rows, fields) {
  if (err) {
    console.log('[query] - :' + err);
    return;
  }
  console.log('##################################################');
  console.log('Query People');
  console.log('##################################################');
  for (var i = 0; i < rows.length; i++) {
    arr_people[i] = rows[i].people_name;
    console.log(typeof rows[i] + " " + i + ":", rows[i]);
  }
});


// --------------------------------------------------------- 执行SQL语句 2
var arr_projects = [];
var sql_query_project = 'SELECT * FROM wse.wse_projects';
connection.query(sql_query_project, function(err, rows, fields) {
  if (err) {
    console.log('[query] - :' + err);
    return;
  }
  console.log('##################################################');
  console.log('Query projects');
  console.log('##################################################');
  for (var i = 0; i < rows.length; i++) {
    arr_projects[i] = rows[i].project_name;
    console.log(typeof rows[i] + " " + i + ":", rows[i]);
  }
  //console.log('People in wse.wse_projects: ', rows);

});

//---------------------------------------------------------  输出查询结果
app.get('/', function(req, res) {
  res.send(arr_people.join(";") + "<br/>" + arr_projects.join(";"));
});

//--------------------------------------------------------- 设置端口号
app.listen(3000);

//---------------------------------------------------------关闭connection
connection.end(function(err) {
  if (err) {
    return;
  }
  console.log('[connection end] succeed!');
});