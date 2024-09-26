const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let thread_id
let thread
let reply_id
let reply

suite('Functional Tests', function() {
 this.timeout(20000)

 //1
 test('Creating a new thread: POST request to /api/threads/{board}',(done)=>{
    chai
    .request(server)
    .post('/api/threads/board')
    .send({text:'t1', delete_password:'p1'})
    .end((err,res)=> {
     thread_id = res.body._id
     assert.equal(res.status, 200);
     assert.equal(res.type, 'application/json')
     assert.equal(res.body.text,"t1")
     assert.equal(res.body.delete_password,'p1');
     done()
    })
  })

 

 //2
 test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}',(done) => {
    chai
    .request(server)
    .get('/api/threads/board')
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'application/json');
     assert.notProperty(res.body,'reported');
     assert.notProperty(res.body,'delete_password');
     assert.isAtMost(res.body.length,10);
     assert.isAtMost(res.body[0].replies.length,3);
     if(res.body.length > 1){
      assert.isAbove(new Date(res.body[0].created_on),new Date(res.body[1].created_on))
     }
     done()
    })
    
 })

//3
test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password',(done) => {
    chai
    .request(server)
    .delete('/api/threads/board')
    .send({thread_id:thread_id, delete_password:'p'})
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'text/html');
     assert.equal(res.text,'incorrect password');
     done()
    }) 
 })

//4
test('Reporting a thread: PUT request to /api/threads/{board}',(done) => {
    chai
    .request(server)
    .put('/api/threads/board')
    .send({thread_id:thread_id})
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'text/html');
     assert.equal(res.text,'reported');
     done()
    }) 
 })

 //5
test('Creating a new reply: POST request to /api/replies/{board}',(done)=>{
    chai
    .request(server)
    .post('/api/replies/board')
    .send({text:'r1', delete_password:'p1',thread_id:thread_id})
    .end((err,res)=> {
     reply_id = res.body._id
     assert.equal(res.status, 200);
     assert.equal(res.type, 'application/json')
     assert.equal(res.body.text,"r1")
     done()
    })
  })

   //6
test('Viewing a single thread with all replies: GET request to /api/replies/{board}',(done)=>{
    chai
    .request(server)
    .get(`/api/replies/board?thread_id=${thread_id}`)
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'application/json');
     assert.notProperty(res.body,'reported');
     assert.notProperty(res.body,'delete_password');
     if(res.body.length > 1){
        assert.isAbove(new Date(res.body[0].created_on),new Date(res.body[1].created_on))
     }
     done()
    })
  })

  //7
test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password',(done) => {
    chai
    .request(server)
    .delete('/api/replies/board')
    .send({thread_id:thread_id, delete_password:'p',reply_id:reply_id})
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'text/html');
     assert.equal(res.text,'incorrect password');
     done()
    }) 
 })

 //8
test('Reporting a reply: PUT request to /api/replies/{board}',(done) => {
    chai
    .request(server)
    .put('/api/threads/board')
    .send({thread_id:thread_id,reply_id:reply_id})
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'text/html');
     assert.equal(res.text,'reported');
     done()
    }) 
 })

 
//9
test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password',(done) => {
    chai
    .request(server)
    .delete('/api/replies/board')
    .send({thread_id:thread_id, delete_password:'p1',reply_id:reply_id})
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'text/html');
     assert.equal(res.text,'success');
     done()
    }) 
 })

//10
test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password',(done) => {
    chai
    .request(server)
    .delete('/api/threads/board')
    .send({thread_id:thread_id, delete_password:'p1'})
    .end((err,res)=> {
     assert.equal(res.status, 200);
     assert.equal(res.type, 'text/html');
     assert.equal(res.text,'success');
     done()
    }) 
 })
 
});


