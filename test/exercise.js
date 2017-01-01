process.env.NODE_ENV = 'test';

var expect = require('chai').expect;
var chai =  require('chai');
var chaiHTTP = require('chai-http');
var db = require('../db.js');
var app = require('../app.js');

var port = process.env.TEST_PORT || 3123;

var host = "http://localhost" + ':' + port;
var path = '/api/v1/exercises';


app.listen(port);

chai.use(chaiHTTP);

     

describe('Exercises', function(){

  //before each test, clear our database
  beforeEach(function(done){
    var sql = "TRUNCATE exercises";
    db.query(sql, function(err, results){
      if (err) {
        throw err; 
      } 
    });
    
    //before each test, insert Squat as an exercise
    // this uses something being tested, so make sure that function
    // can do it's job right :)
    chai.request(host)
      .post(path)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({name: 'Squat', category:'strength' })
      .end(function(err, res, body) {
          if (err) {
            done(err);
          } else {
            done();
          } 
        });
    
    }); //end beforeEach

  afterEach(function() {
    console.log('\n');
   });

  //Test GET all exercises
  describe('Testing GET /exercises', function(){

    it("should return an array containing all exercises", function(done){
       chai.request(host)
        .get(path)
        .end(function(err,res,body){

          if (err) {

            done(err); 

          } else {
            
            expect(res.statusCode).to.equal(200); 

            var response = JSON.parse(res.text);

            expect(response).to.be.an('array')  
            expect(response[0]).to.be.an('object');
            expect(response[0].name).to.equal('Squat');

            done();
          } 
        });
    }) //done regular GET /exercises test
  }); //done GET /exercises tests



  //Test insertion of exercise into database 
  describe('Testing POST /exercises', function(){
    it('should store an exercise if valid data is sent', function(done){
     chai.request(host)
      .post(path)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({name: 'Deadlift', category:'strength' })
      .end(function(err, res, body) {

          if (err) {
            done(err);
          } else {


            expect(res.statusCode).to.equal(201);

            chai.request(host)
            .get(path)
            .end(function(err,res, body){
              

              if (err) {
                done(err); 
              } else { 
                expect(JSON.parse(res.text)).to.have.length(2);
                done();
              } 
       
            });

          } 
        }); 
    }); //done valid post request test

    it('should fail to store an exercise if duplicate named exercise data is sent', function(done){
     chai.request(host)
      .post(path)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({name: 'Squat', category:'strength' })
      .end(function(err, res, body) {


        //first, make sure that we're getting an error and we know why
        if (err) {
          expect(err.status).to.equal(400); 
          
          expect(res.body).to.have.property('error');

        }  else {
          
          done('Failing to get an error when storing a duplicate named entity');
        }
       
        //second, make sure that nothing persisted in our DB
        chai.request(host)
          .get(path)
          .end(function(err,res, body){   
            if (err) {
              done(err); 
            } else { 
              expect(JSON.parse(res.text)).to.have.length(1);
              done();
            } 
       
          });

        }); 
    }); //done invalid name test 

  
 
    it('should fail to store an exercise where the category isn\'t cardio or strength', function(done){
     chai.request(host)
      .post(path)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({name: 'Squat', category:'fun' })
      .end(function(err, res, body) {


        //first, make sure that we're getting an error and we know why
        if (err) {
          expect(err.status).to.equal(400); 
          
          expect(res.body).to.have.property('error');

        }  else {
          
          done('Failing to get an error when storing a duplicate named entity');
        }
       
        //second, make sure that nothing persisted in our DB
        chai.request(host)
          .get(path)
          .end(function(err,res, body){   
            if (err) {
              done(err); 
            } else { 
              expect(JSON.parse(res.text)).to.have.length(1);
              done();
            } 
       
          });

        }); 
    }); //done invalid category test 


  }); //done /POST tests


  describe('Testing GET /:id', function(){

    it('should return the exercise with id as the given parameter', function(done){
      chai.request(host)
        .get(path)
        .end(function(err, res, body){
          if (err) {
            done(err); 
          }  else {
           
            var exercise = JSON.parse(res.text)[0];
            
            chai.request(host)
              .get(path + '/' + exercise.id)
              .end(function(err, res, body){
                
                if (err) {
                  done(err); 
                } else {

                  expect(res.statusCode).to.equal(200);
                  
                  expect(res.body).to.be.an('object');

                  expect(res.body.id).to.equal(exercise.id);
                  expect(res.body.name).to.equal(exercise.name);
                  
                  done();
                }
              
              });
          }
        }) 
    }); //end regular request test
 

    it('should return an error if given a bad ID ', function(done){
      chai.request(host)
        .get(path + '/42')
        .end(function(err, res, body){
          if (err) {
            expect(err.status).to.equal(404);
            done();

          }  else {
            done('Server should 404 on bad ID given to GET /:id');
          }
        }) 
    }); //end bad request test

  }); //end GET /:id tests


  describe('Testing PUT /:id', function(){

    it('should update the exercise with id of :id', function(done){
      chai.request(host)
        .get(path)
        .end(function(err, res, body){
          if (err) {
            done(err); 
          }  else {
           
            var exercise = JSON.parse(res.text)[0];
           
            exercise.name = 'Bench Press';
            chai.request(host)
              .put(path + '/' + exercise.id)
              .send(exercise)
              .end(function(err, res, body){
                
                if (err) {
                  done(err); 
                } else {

                  expect(res.statusCode).to.equal(204);
                 
                  chai.request(host)
                    .get(path)
                    .end(function(err, res, body){

                      if (err) {
                        done(err); 
                      } else {
                        
                        var response = JSON.parse(res.text)[0]; 

                        expect(response.name).to.equal('Bench Press'); 
                        done();

                      } 

                    });
                }
              
              });
          }
        }) 
    }); //end regular name change request test 
 

    it('should return an error if it tries to change an exercise that doesn\'t exist ', function(done){
      chai.request(host)
        .put(path + '/42')
        .send({id:42, category:'who cares', name:'who cares'})
        .end(function(err, res, body){
          if (err) {
            expect(err.status).to.equal(400);
            done();

          }  else {
            done('Server should 400 on bad ID given to PUT /:id');
          }
        }); 
    }); //end bad request test

    it('should return an error if it tries to change the category of an exercise with id of :id to something invalid', function(done){
      chai.request(host)
        .get(path)
        .end(function(err, res, body){
          if (err) {
            done(err); 
          }  else {
           
            var exercise = JSON.parse(res.text)[0];
           
            exercise.category = 'Something that should cause a failure';
            chai.request(host)
              .put(path + '/' + exercise.id)
              .send(exercise)
              .end(function(err, res, body){
                
                if (err) {
                  expect(err.status).to.equal(400);
                  done()
                } else {
                  done('Server should 400 on bad category given to PUT /:id')
                }
              
              });
          }
        }) 
    }); // end bad category PUT /:id test
  
  }); //end GET /:id tests


  describe('Testing DELETE /:id', function(){

    it('should delete the exercise with id as the given parameter', function(done){
      chai.request(host)
        .get(path)
        .end(function(err, res, body){
          if (err) {
            done(err); 
          }  else {
           
            var exercise = JSON.parse(res.text)[0];
            
            chai.request(host)
              .delete(path + '/' + exercise.id)
              .end(function(err, res, body){
                
                if (err) {
                  done(err); 
                } else {

                  expect(res.statusCode).to.equal(204);
                 

                  chai.request(host)
                    .get(path)
                    .end(function(err, res, body){
                      if (err) {
                        done(err); 
                      } else {
                        var exercises = JSON.parse(res.text);
                        expect(exercises).to.have.length(0);
                        done();
                      } 
                    });
                }
              
              });
          }
        }) 
    }); //end delete request test
 

    it('should return an error if given a bad ID ', function(done){
      chai.request(host)
        .delete(path + '/42')
        .end(function(err, res, body){
          if (err) {
            expect(err.status).to.equal(404);
            done();

          }  else {
            done('Server should 404 on bad ID given to DELETE /:id');
          }
        }) 
    }); //end bad request test

  }); //end DELETE /:id tests

}); //done exercise test
