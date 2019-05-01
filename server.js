const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const _ = require('lodash');
const port = 8080;
let factories = [{id: 1, name: 'Test', upper: 10, lower: 1, numbers: []}];

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function(socket) {
  console.log('new connection made');

  socket.on('get-factories', function(){
    socket.emit('all-factories', factories);
  });
  socket.on('get-factories', function(){
    socket.emit('all-factories', factories);
  });

  socket.on('add-factory', function(data){
    console.log(data);
    let factoryObj = {
      id: data.id,
      name: data.name,
      upper: data.upper,
      lower: data.lower,
      numbers: []
    };
    factories.push(factoryObj);
    io.emit('all-factories', factories);
  });

  socket.on('add-factory', function(data){
    factories[data.id] = {
      id: data.id,
      name: data.name,
      upper: data.upper,
      lower: data.lower,
      numbers: []
    };
    console.log('new factory created: ' + data.name);
    console.log('factories: ' + factories);
    io.emit('all-factory', factories);
  });

  socket.on('generate', function(data){
    console.log(data);
    let factory = factories[data.factoryId - 1];
    for (let i = 0; i < data.count; i++){
      let num = Math.floor(Math.random() * factory.upper) + factory.lower;
      factory.numbers.push(num);
      console.log('Random number generated for factory ' + factory.name + ': ' + num);
    }
    io.emit('all-factories', factories);
  });
});

server.listen(port, function() {
  console.log("Listening on port " + port);
});


