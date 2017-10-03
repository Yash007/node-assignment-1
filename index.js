var SERVER_NAME = 'Student-api'
var PORT = 3000;
var HOST = '127.0.0.1';

var filename = 'database.json';
var fs = require('fs');

var data = fs.readFileSync(filename);
var student_data_JSON = JSON.parse(data);


var getRequestCounter = 0;
var postRespnseCounter = 0;


var restify = require('restify')
  // Get a persistence engine for the users
  , studentsSave = require('save')('students')
  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})
    server.listen(PORT, HOST, function () {
        console.log("Server is listening on: " + HOST + ":" + PORT);
        console.log("End Points :");
        console.log( HOST + ":" + PORT +"/sendGet   method: GET");
        console.log( HOST + ":" + PORT +"/sendPost   method: POST");
        console.log( HOST + ":" + PORT +"/sendDelete   method: DELETE");
        
        console.log(student_data_JSON);

        console.log('Resources:')
        console.log(' /students')
        console.log(' /students/:id')  
    })

server
.use(restify.fullResponse())
.use(restify.bodyParser())

//Create Post Request that stores data
    server.post('/sendPost', function (req, res, next) {
  
        console.log("sendPost: Sending response...");
        postRespnseCounter++;
        
        console.log("Processed Request Counter -> sendGet : " + getRequestCounter + ", sendPost : " + postRespnseCounter);
            
        if (req.params.name === undefined ) {
            return next(new restify.InvalidArgumentError('Name must be supplied'))
        }

        if (req.params.age === undefined ) {
            return next(new restify.InvalidArgumentError('Age must be supplied'))
        }

        var newStudent = { 
            name: req.params.name, 
            age: req.params.age,
            _id: req.params._id
        }

        studentsSave.create( newStudent, function (error, student) {
            student_data_JSON[req.params.name] = req.params.age;
            var write_data = JSON.stringify(student_data_JSON,null,2);
            fs.writeFile(filename,write_data,finished);
            function finished(err) {console.log('Data stored in json file');}
            if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
            res.send(201, student)
        })
    })

// Display Student data by get request
    server.get('/sendGet', function (req, res, next) {
        console.log("sendGet: Received request..");
        getRequestCounter++;
        console.log("Processed Request Counter -> sendGet : " + getRequestCounter + ", sendPost : " + postRespnseCounter);
        studentsSave.find({}, function (error, students) {
        console.log(student_data_JSON);
         res.send(student_data_JSON);
       })
    })

// Display Student data by id with GET method
    server.get('/Students/:id', function (req, res, next) {
        studentsSave.findOne({ _id: req.params.id }, function (error, students) {
            getRequestCounter++;
            console.log("Processed Request Counter -> sendGet : " + getRequestCounter + ", sendPost : " + postRespnseCounter);
        if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
        if (students) {
            res.send(students)
        } else {
            res.send(404)
        }
      })
    })

// PUT request(update) for updating student records
    server.put('/students/:id', function (req, res, next) {
        if (req.params.name === undefined ) {
            return next(new restify.InvalidArgumentError('Name must be supplied'))
        }
        if (req.params.age === undefined ) {
            return next(new restify.InvalidArgumentError('Age must be supplied'))
        }
        
        var newStudent = {
            _id: req.params.id,
            name: req.params.name, 
            age: req.params.age
        }

        studentsSave.update(newStudent, function (error, student) {
            if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
            res.send(200)
        })
    })

// Delete method for deleting records
    server.del('/students/:id', function (req, res, next) {
        studentsSave.delete(req.params.id, function (error, student) {
            if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
            res.send(200)
        })
    })

// Delete Method for Deleting ALL Records
    server.get('/sendDelete', function (req, res, next) {
        console.log("sendDelete: Received request!");
        studentsSave = require('save')('students')
        res.send("All Records Deleted");
    })