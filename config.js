var config = {};

config.mysql= {};



config.mysql.host =  process.env.MYSQL_HOST || 'localhost';
config.mysql.user = process.env.MYSQL_USER || 'root';
config.mysql.password = process.env.MYSQL_PASSWORD || 'password';
config.mysql.database = process.env.MYSQL_DATABASE || 'app';

if( process.env.NODE_ENV === 'test' ) {
  config.mysql.database = 'test';
}


module.exports = config;
