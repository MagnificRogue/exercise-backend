var mysql = require('mysql');
var config = require('./config')

// create the mysql connection

var connection = mysql.createConnection({
  host:  config.mysql.host,
  user:  config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
});


connection.connect(function(err){
  if(err){
    console.error('error connecting:' + err.stack);
  }

  //console.log('connected as id ' + connection.threadId);
});


module.exports = connection;

