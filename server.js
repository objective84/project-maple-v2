const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require('mysql');
const _ = require('lodash');
const port = 8080;
const conn = mysql.createConnection({
    host: "us-cdbr-iron-east-02.cleardb.net",
    port: '3306',
    database: 'heroku_b7b4fb058339645',
    user: "bc9a70a27c9657",
    password: "c866efb8"
});
conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function (socket) {
    console.log('new connection made');
    //Upon connecting, a new socket needs a list of all factories, so assemble the list and send it to the new socket
    //first get a list of all factories
    conn.query('select * from factory', null, (error, results, fields) => {
        if (error)
            console.log(error);
        else {
            //organize the list into a Map<factoryId, factory>, so it is easier to add the numbers
            let factories = {};
            _.each(results, (factory) => {
                factory.numbers = [];
                factories[factory.factoryId] = factory;
            });
            //next get a list of all numbers
            conn.query('select * from factory_numbers',
                (e, r, f) => {
                    if (e)
                        console.log(e);
                    else {
                        //iterate through the list of numbers and assign them to the correct factory
                        _.each(r, (num) => {
                            factories[num.factoryId].numbers.push(num.number);
                        });
                        //send the list to the new socket ONLY
                        socket.emit('all-factories', Object.values(factories));
                    }
                });
        }
    });

    //Adds or edits a factory
    socket.on('add-factory', function (data) {
        if (_.isNull(data.factoryId)) {
            //if the id is null, then this is a new factory so insert it
            sql = 'insert into factory (`name`, `upper`, `lower`) values(?,?,?)';
            conn.query(sql, [data.name, data.upper, data.lower], (error, result, fields) => {
                data.factoryId = result.insertId;
                //broadcast the new factory to all open sockets
                io.emit('new-factory', data);
            });
        } else {
            //otherwise, we are updating an existing factory
            let factory = data;
            conn.query('update factory set name = ?, upper = ?, lower = ? where factoryId = ?',
                [factory.name, factory.upper, factory.lower, factory.factoryId],
                (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        //broadcast the updated factory to all open sockets
                        io.emit('update-factory', factory);
                    }
                }
            )
        }
    });

    //Generates N random numbers
    socket.on('generate', function (data) {
        //first get the factory so we have the upper and lower limits
        conn.query('select * from factory where factoryId = ?',
            [data.factoryId],
            (error, results, fields) => {
                if (error)
                    console.log(error);
                else if (results.length === 0)
                    console.log('Error: factory not found.');
                else {
                    let factory = results[0];
                    //next delete any numbers currently associated with this factory
                    conn.query('delete from factory_numbers where factoryId = ?',
                        [data.factoryId],
                        (error1, results1, fields1) => {
                            if (error1)
                                console.log(error);
                            //generate the random numbers according to the upper and lower limits
                            let numbers = [];
                            factory.numbers = [];
                            for (let i = 0; i < data.count; i++) {
                                let num = Math.floor(Math.random() * factory.upper) + factory.lower;
                                numbers.push([data.factoryId, num]);
                                factory.numbers.push(num);
                            }
                            //insert the new numbers into the database
                            conn.query('insert into factory_numbers (`factoryId`, `number`) values ?',
                                [numbers],
                                (error2, results2, fields2) => {
                                    if (error2)
                                        console.log(error2);
                                    else
                                    //finally, broadcast the updated factory to all open sockets
                                        io.emit('update-factory', factory);
                                });
                        });
                }
            })
    });

    //Delete a factory
    socket.on('delete-factory', function (data) {
        //first delete all numbers associated with this factory (if any)
        conn.query('delete from factory_numbers where factoryId = ?',
            [data.factoryId],
            (error, results, fields) => {
                if (error)
                    console.log(error);
                //now we can delete the factory
                conn.query('delete from factory f where f.factoryId = ?',
                    [data.factoryId],
                    (error, result, fields) => {
                        if (error)
                            console.log(error);
                        else {
                            //broadcast the deletion to all open sockets
                            io.emit('delete-factory', data.factoryId);
                        }
                    });

            })
    })
});

server.listen(port, function () {
    console.log("Listening on port " + port);
});


