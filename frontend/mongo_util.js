const assert = require('assert');

exports.insertDocument = function(db, name, doc, callback) {
  // Get the documents collection
  var collection = db.collection(name);
  // Insert some documents
  collection.insertMany([doc], function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    callback(result);
  });
}


exports.findDocument = function(db, name, key, callback) {
  // Get the documents collection
  var collection = db.collection(name);

  // Find some documents
  collection.find(key).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
}


exports.updateDocument = function(db, name, key, new_key, callback) {
  // Get the documents collection
  var collection = db.collection(name);

  // Update document with new key
  collection.updateOne(
    key,
    { $set: new_key },
    function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        callback(result);
    }
  );
}

/*
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
*/
