const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'grpc';
// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    setInterval(function(){
        console.log('Nueva Lectura!!!');
        const collection = db.collection('items');
        collection.find({'state':'nok'}).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log(docs);
        });
    }, 3000);
});