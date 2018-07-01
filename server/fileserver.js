const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 9000;

// MongoDb variables
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var mongo_url = 'mongodb://localhost:27017/myproject';


http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);

  // parse URL
  const parsedUrl = url.parse(req.url);
 
  // extract query parameters
  var parms = null;
  if (parsedUrl.query != null) 
  {
      parms = parsedUrl.query.split('&')   
      
      // parse parameters
      parsed_parms = {};
      for (var i = 0; i < parms.length; i ++) {
          parsed_pair = parms[i].split('=');
          parsed_parms[parsed_pair[0]] = parsed_pair[1];
      }
      
      parms = parsed_parms;
  }
  
  // handle app services
  let pathname = "";
  if (parsedUrl.pathname == '/register') 
  {
      console.log("Tried to sign up");
      sign_up_request(res, parms);
      return;
  }
  else if (parsedUrl.pathname == '/login') 
  {
      console.log("Tried to login");  
      login_request(res, parms);
      return;      
  }
  else if (parsedUrl.pathname == '/save') 
  {
      console.log("Tried to save");  
      
      // Get request body
      var reqBody = '';
      req.on('data', function(data) {
        reqBody += data;
        if(reqBody.length > 1e7) {
          res.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
          res.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
        }
      });
      req.on('end', function() {
        console.log(reqBody);
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/plain' );
        res.end("Saved successfully");
      }); 
      return;      
  }
  
  // this case means the user want a file
  else{
      if(parsedUrl.pathname == '/getfile')
      {
          pathname = "/" + parms["name"];
      }else 
      {
          pathname = parsedUrl.pathname;
      }

      pathname = `./..${pathname}`;
      console.log(pathname);

      // extract URL path
      
      // based on the URL path, extract the file extention. e.g. .js, .doc, ...
      const ext = path.parse(pathname).ext;
      // maps file extention to MIME typere
      const map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
      };

      fs.exists(pathname, function (exist) {
        if(!exist) {
          // if the file is not found, return 404
          res.statusCode = 404;
          res.end(`File ${pathname} not found!`);
          return;
        }
        
        // if is a directory search for index file matching the extention
        if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;
        
        // read file from file system
        fs.readFile(pathname, function(err, data){
          if(err){
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            // if the file is found, set Content-type and send data
            res.setHeader('Content-type', map[ext] || 'text/plain' );
            res.end(data);
          }
        });
      });
   }
}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);


//
//
// MONGO DB CLIENT FUNCTIONS
//
//

var login_request = function(res, parms) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      findDocument(
        db, 
        'users',
        {username: parms["username"]}, 
        function(docs) {
          var code = 200;
          var msg = "";
          
          console.log(docs);
          console.log(parms["password"]);
          
          if (docs.length > 0 && docs[0]['password'] == parms["password"]) {
            msg = "Login successfully";
          } else {
            msg = "Try again";
          }
          console.log(msg);
          
          res.statusCode = code;
          res.end(msg);
          db.close();
        }
      );
    });
}

var sign_up_request = function(res, parms) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      insertDocument(
        db, 
        'users',
        parms, 
        function(docs) {
          var code = 200;
          var msg = "Sign up successfully";
          console.log(msg);
          
          res.statusCode = code;
          res.end(msg);
          db.close();
        }
      );
    });
}


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

var insertDocument = function(db, name, doc, callback) {
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


var findDocument = function(db, name, key, callback) {
  // Get the documents collection
  var collection = db.collection(name);
  
  // Find some documents
  collection.find(key).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
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

var updateDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a : 2 }
    , { $set: { b : 1 } }, function(err, result) {
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
