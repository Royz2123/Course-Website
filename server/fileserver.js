const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 9000;

var maxParms = 10;

// MongoDb variables
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var mongo_url = 'mongodb://localhost:27017/myproject';

function parseParms(query)
{
  if (query != null)
  {
      parms = query.split('&', maxParms);

      // parse parameters
      parsed_parms = {};
      for (var i = 0; i < parms.length; i ++) {
          parsed_pair = parms[i].split('=');
          content = parsed_pair.slice(1, parsed_pair.length).join('=');
          parsed_parms[parsed_pair[0]] = content;
      }

      return parsed_parms;
  }
  return null;
}


http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);

  // parse URL
  const parsedUrl = url.parse(req.url);

  // extract query parameters
  var parms = parseParms(parsedUrl.query);

  // handle app services
  var pathname = "";
  if (parsedUrl.pathname == '/register')
  {
      console.log("Tried to sign up");
      sign_up_request(res, parms);
  }
  else if (parsedUrl.pathname == '/login')
  {
      console.log("Tried to login");
      login_request(res, parms);
  }
  else if (
    parsedUrl.pathname == '/save'
    || parsedUrl.pathname == '/upload'
    || parsedUrl.pathname == '/create'
  )
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
        // parse POST parameters
        parms = parseParms(reqBody, 2);

        save_request(
            res,
            {
                filename : parms["fname"],
                content : parms["html"]
            },
            true
        );
      });
  }
  else if (parsedUrl.pathname == '/getfile')
  {
      load_request(res, {filename : parms["name"]})
  }

  // this case means the user want a regular html page
  else{
      pathname = parsedUrl.pathname;
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
// SERVICE FUNCTIONS
//
//

var login_request = function(res, parms) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);
      findDocument(
        db,
        'users',
        {username: parms["username"]},
        function(docs) {
          var code = 200;
          var msg = "";

          if (docs.length > 0 && docs[0]['password'] == parms["password"]) {
            msg = "Login successfully";
          } else {
            msg = "Try again";
          }

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

      insertDocument(
        db,
        'users',
        parms,
        function(docs) {
          var code = 200;
          var msg = "Sign up successfully";

          res.statusCode = code;
          res.end(msg);
          db.close();
        }
      );
    });
}


var save_request = function(res, parms, create) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      // check if file exists:
      findDocument(
        db,
        'documents',
        {
            filename : parms['filename']
        },
        function(docs) {
          var code = 200;
          var msg = "";

          if (docs.length == 0 && create) {
            insertDocument(
                db,
                "documents",
                {
                    //TODO: add username based filtering -- 'username' : parms['username'],
                    filename : parms['filename'],
                    content : "New Document"
                },
                function(docs) {
                  var code = 200;
                  var msg = "Save successfully";

                  res.statusCode = code;
                  res.end(msg);
                  db.close();
                }
            );
          } else {
            updateDocument(
                db,
                'documents',
                {
                    //TODO: add username based filtering -- 'username' : parms['username'],
                    filename : parms['filename']
                },
                {
                    content : parms['content']
                },
                function(docs) {
                  var code = 200;
                  var msg = "Save successfully";

                  res.statusCode = code;
                  res.end(msg);
                  db.close();
                }
            );
          }
        }
      );


    });
}


var load_request = function(res, parms) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      findDocument(
        db,
        'documents',
        {
            filename : parms['filename']
        },
        function(docs) {
          var code = 200;
          var msg = "Load successfully";

          console.log(docs);

          if (docs.length > 0) {
            msg = docs[0]["content"];
          } else {
            code = 404;
            msg = "File not found";
          }

          res.statusCode = code;
          res.end(msg);
          db.close();
        }
      );
    });
}


var upload_request = function(res, parms) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      insertDocument(
        db,
        'documents',
        parms,
        function(docs) {
          var code = 200;
          var msg = "Uploaded file successfully";

          res.statusCode = code;
          res.end(msg);
          db.close();
        }
      );
    });
}



//
//
// MONGO DB CLIENT FUNCTIONS
//
//


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


var updateDocument = function(db, name, key, new_key, callback) {
  // Get the documents collection
  var collection = db.collection(name);

  // Update document with new key
  collection.updateOne(
    key,
    { $set: new_key },
    function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Updated the document with the field a equal to " + new_key);
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
