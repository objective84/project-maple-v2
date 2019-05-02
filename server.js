const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require('mysql');
const _ = require('lodash');
const port = process.env.PORT || 8080;
let conn = null;
app.use(express.static(path.join(__dirname, "public")));
let db_config = {
    host: "us-cdbr-iron-east-02.cleardb.net",
    port: '3306',
    database: 'heroku_b7b4fb058339645',
    user: "bc9a70a27c9657",
    password: "c866efb8"
};

//Prevents the app from crashing do to a database disconnect
const handleDisconnect = () => {
    conn = mysql.createConnection(db_config);

    //On connection attempt
    conn.connect( (err) =>{
        if (err) {
            console.log('Error when connecting to db:' + err);
            setTimeout(handleDisconnect, 10000);
        } else
            console.log("Connected to database!");
    });

    //If the database returns a connection-lost error, reconnect
    conn.on('error', (err) => {
        console.log('Database error' + err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST')
            handleDisconnect();
        else
            throw err;
    });
};

handleDisconnect();

io.on('connection', (socket) =>{
    try {
        console.log('new connection made');
        //Upon connecting, a new socket needs a list of all factories, so assemble the list and send it to the new socket
        //first get a list of all factories
        conn.query('select * from factory', null, (error, results, fields) => {
            if (error)
                console.log('Database Error: ' + error);
            else {
                //organize the list into a Map<factoryId, factory>, so it is easier to add the numbers
                console.log('Factories found: ' + results.length);
                let factories = {};
                _.each(results, (factory) => {
                    factory.numbers = [];
                    factories[factory.factoryId] = factory;
                });
                //next get a list of all numbers
                conn.query('select * from factory_numbers',
                    (e, r, f) => {
                        if (e)
                            console.log('Database Error: ' + e);
                        else {
                            //iterate through the list of numbers and assign them to the correct factory
                            console.log('Numbers found: ' + r.length);
                            _.each(r, (num) => {
                                factories[num.factoryId].numbers.push(num.number);
                            });
                            //send the list to the new socket ONLY
                            console.log('Factories successfully assembled');
                            socket.emit('all-factories', Object.values(factories));
                        }
                    });
            }
        });
    } catch (e) {
        console.log("Unhandled Exception: " + e);
    }

    //Adds or edits a factory
    socket.on('add-factory', (data) => {
        try {
            if (!data.name || !data.upper || !data.lower) return; //Extra validation to prevent bad data
            console.log('Adding/Editing factory');
            if (_.isNull(data.factoryId)) {
                //if the id is null, then this is a new factory so insert it
                sql = 'insert into factory (`name`, `upper`, `lower`) values(?,?,?)';
                conn.query(sql, [data.name, data.upper, data.lower], (error, result, fields) => {
                    data.factoryId = result.insertId;
                    //broadcast the new factory to all open sockets
                    console.log('Successfully added new factory: ' + data);
                    io.emit('new-factory', data);
                });
            } else {
                //otherwise, we are updating an existing factory
                let factory = data;
                conn.query('update factory set name = ?, upper = ?, lower = ? where factoryId = ?',
                    [factory.name, factory.upper, factory.lower, factory.factoryId],
                    (error, results) => {
                        if (error) {
                            console.log('Database Error: ' + error);
                        } else {
                            //broadcast the updated factory to all open sockets
                            console.log('Successfully edited factory: ' + factory);
                            io.emit('update-factory', factory);
                        }
                    }
                )
            }
        } catch (e) {
            console.log("Unhandled Exception: " + e);
        }
    });

    //Generates N random numbers
    socket.on('generate', (data) =>{
        try {
            if (!data.count || data.count <= 0) return; //Extra validation
            console.log('Generating numbers for factory: ' + data.factoryId);
            //first get the factory so we have the upper and lower limits
            conn.query('select * from factory where factoryId = ?',
                [data.factoryId],
                (error, results, fields) => {
                    if (error)
                        console.log('Database Error: ' + error);
                    else if (_.isNull(results[0]))
                        console.log('Database Error: factory not found: ' + data.factoryId);
                    else {
                        let factory = results[0];
                        console.log('Found factory: ' + factory);
                        //next delete any numbers currently associated with this factory
                        conn.query('delete from factory_numbers where factoryId = ?',
                            [data.factoryId],
                            (error1, results1, fields1) => {
                                if (error1)
                                    console.log('Database Error: ' + error);
                                //generate the random numbers according to the upper and lower limits
                                console.log('Deleted previous factory numbers');
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
                                        else {
                                            //finally, broadcast the updated factory to all open sockets
                                            console.log('Successfully generated new numbers for ' + factory.name + ': ' + numbers);
                                            io.emit('update-factory', factory);

                                        }

                                    });
                            });
                    }
                })
        } catch (e) {
            console.log("Unhandled Exception: " + e);
        }
    });

    //Delete a factory
    try {
        socket.on('delete-factory', (data) => {
            console.log('Deleting factory: ' + data.factoryId);
            //first delete all numbers associated with this factory (if any)
            conn.query('delete from factory_numbers where factoryId = ?',
                [data.factoryId],
                (error, results, fields) => {
                    if (error)
                        console.log('Database Error: ' + error);
                    //now we can delete the factory
                    console.log('Numbers deleted for factory: ' + data.factoryId);
                    conn.query('delete from factory where factoryId = ?',
                        [data.factoryId],
                        (error, result, fields) => {
                            if (error)
                                console.log('Database Error: ' + error);
                            else {
                                //broadcast the deletion to all open sockets
                                console.log('Factory successfully deleted: ' + data.factoryId);
                                io.emit('delete-factory', data.factoryId);
                            }
                        });

                })
        })
    } catch (e) {
        console.log("Unhandled Exception: " + e);
    }
});

server.listen(port, () => {
    console.log("Listening on port " + port);
});


