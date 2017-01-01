var express = require('express');
var router = express.Router();
var connection = require('../db');
var mysql = require('mysql');

// create the mysql connection

/* GET exercises listing. */
router.get('/', function(req, res) {


  var sql = "SELECT * FROM exercises ";

  connection.query(sql, function(err, results){
    if (err){
      throw err; 
    } 
   
    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  });

});

/* GET single exercise by id */
router.get('/:id', function(req,res){
  var sql = "SELECT * FROM exercises WHERE id=?";
  var insert = [req.params.id];

  connection.query(mysql.format(sql,insert), function(err, results){
    if (err){
      throw err;    
    } 

    if(results.length === 0){
      res.status(404);    
    } 
    
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results[0]));

  });

});

/* POST a exercise to the data store  */
router.post('/', function(req,res){

  var sql = "INSERT INTO exercises ( `name`, `category`) VALUES (?,?)";
  var insert = [req.body.name, req.body.category];
  
  connection.query(mysql.format(sql,insert), function(err, results){
    if (err) {
      //throw err; 
      res.status(400);
      res.send({'error': err});
    } else {
  
      res.status(201);
      res.send('OK');
    } 

  });

});

/* PUT an update to a exercise in our data store */
router.put('/:id',function(req,res){
 
  var sql = "UPDATE exercises SET name = ?, category=? WHERE id=?";
  var insert = [req.body.name, req.body.category, req.params.id];

  connection.query(mysql.format(sql,insert), function(err, results){
    if (err) {

      res.status(400);
      res.send({'error':err});

    } else {

      if(results.affectedRows){
        res.status(204);
        res.send(); 
      } else {
        res.status(400);
        res.send({'error':'No such exercise exists'});
      }

    } 

  });

});

/* DELETE a exercise from our data store */
router.delete('/:id', function(req,res){
  
  var sql = "DELETE FROM exercises WHERE id=?";
  var insert = [req.params.id];


  connection.query(mysql.format(sql,insert), function(err, results){

    if (err) {
      //throw err; 
      res.status(400);
      res.send({'error':err});

    } else {

      if(results.affectedRows){ 
        res.status(204);
        res.send(); 
       } else {
        res.status(404);
        res.send({'error': 'Exercise with id of ' + req.params.id + ' does not exist.'})
       }
    } 
  });

});

module.exports = router;
