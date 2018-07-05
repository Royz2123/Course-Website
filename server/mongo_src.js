var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';

// Use connect method to connect to the server
var conncection = function() {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      username = "Royz";
      password = "1234";
      filename1 = "index.html";
      content1 = "The page we want to edit";
      
      // Inserts a "document to the database" 
      
      insertDocument(db, {name : username, filename : filename1}, function() {
          db.close();
      });
      
      // help a user find his document 
      updateDocument(db, 'documents', {name : username, filename : filename1}, {content: content1}, function() {
          db.close();
      });
      findDocument(db, 'documents', {filename : filename1}, function() {
          db.close();
      });
    });
}

conncection();
//conncection();


var login = function(db, username, callback) {
  // Get the users collection
  var collection = db.collection('users');
  // Insert some documents
  collection.find(username).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}

var insertDocument = function(db, doc, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([doc], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}


var findDocument = function(db, name, key, callback) {
  // Get the documents collection
  var collection = db.collection(name);
  
  // Find some documents
  collection.find(key).toArray(function(err, docs) {
    assert.equal(err, null);
    //console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

var updateDocument = function(db, name, key, new_data, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.updateOne(
    key,
    { $set: new_data }, 
    function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });  
}


var removeDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Delete document where a is 3
  collection.deleteOne({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });    
}


var indexCollection = function(db, callback) {
  db.collection('documents').createIndex(
    { "a": 1 },
      null,
      function(err, results) {
        console.log(results);
        callback();
    }
  );
};