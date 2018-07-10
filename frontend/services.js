// imported modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// my modules
var http_util = require('./http_util');
var mongo_util = require('./mongo_util');

// Variables
var users = {}
const restricted_services = [
    "/save",
    "/list",
    "/upload",
    "/load"
]

// MongoDb variables
var MongoClient = require('mongodb').MongoClient
var mongo_url = 'mongodb://localhost:27017/myproject';


// FUNCTIONS

var isRestricted = function(query) {
    return restricted_services.includes(query)
}

exports.isUnauthorized = function(cookies, url) {  
    return (
        isRestricted(url) 
        && (
            !cookies["usr_cookie"]
            || !users[cookies["usr_cookie"]]
        )
    )
}

exports.get_request = function(res, pathname) {
    pathname = `./..${pathname}`;

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

exports.login_request = function(res, parms) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);
      mongo_util.findDocument(
        db,
        'users',
        {
            username: parms["username"]
        },
        function(docs) {
          var code = 200;
          var msg = "";

          if (docs.length > 0 && docs[0]['password'] == parms["password"]) {
            msg = "1";
          } else {
            msg = "0";
          }

          res.statusCode = code;
          
          // set cookie for future communication
          var cookie = http_util.createCookie();
          users[cookie] = parms["username"];
          res.setHeader(
		'Set-Cookie', [
			'usr_cookie=' + cookie,
			'username=' + parms["username"]
		]
	);
          
          res.end(msg);
          db.close();
        }
      );
    });
}

exports.logout_request = function(res, parms, cookies) {
    delete users[cookies["usr_cookie"]];

	// redirect to homepage
          fs.readFile("../index.html", function(err, data){
              if(err){
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
              } else {
                // if the file is found, set Content-type and send data
                res.statusCode = 200;
                res.setHeader('Content-type', 'text/html');
                res.setHeader(
			'Set-Cookie', [
				'usr_cookie=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT', 
				'username=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT', 
			]		
		);
                res.end(data);
              }

          });
}

exports.sign_up_request = function(res, parms) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      mongo_util.insertDocument(
        db,
        'users',
        parms,
        function(docs) {
          // set cookie for future communication
          var cookie = http_util.createCookie();
          users[cookie] = parms["username"];

          // redirect to homepage
          fs.readFile("../index.html", function(err, data){
              if(err){
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
              } else {
                // if the file is found, set Content-type and send data
                res.statusCode = 200;
                res.setHeader('Content-type', 'text/html');
                res.setHeader(
		'Set-Cookie', [
			'usr_cookie=' + cookie,
			'username=' + parms["username"]
		]
	);
                res.end(data);
              }
            db.close();
          });
        }
      );
    });
}


exports.save_request = function(res, parms, cookies, create) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      // check if file exists:
      mongo_util.findDocument(
        db,
        'documents',
        {
            filename : parms['filename'],
            username : users[cookies['usr_cookie']]
        },
        function(docs) {
          var code = 200;
          var msg = "";

          if (docs.length == 0 && create) {
            mongo_util.insertDocument(
                db,
                "documents",
                {
                    username : users[cookies['usr_cookie']],
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
            mongo_util.updateDocument(
                db,
                'documents',
                {
                    username : users[cookies['usr_cookie']],
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


exports.load_request = function(res, parms, cookies) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      mongo_util.findDocument(
        db,
        'documents',
        {
            username : users[cookies['usr_cookie']],
            filename : parms['filename']
        },
        function(docs) {
          var code = 200;
          var msg = "Load successfully";

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


exports.list_request = function(res, parms, cookies) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      mongo_util.findDocument(
        db,
        'documents',
        {
            username : users[cookies['usr_cookie']],
        },
        function(docs) {
          var code = 200;
          var msg = JSON.stringify(docs);

          res.statusCode = code;
          res.end(msg);
          db.close();
        }
      );
    });
}



exports.upload_request = function(res, parms, cookies) {
    MongoClient.connect(mongo_url, function(err, db) {
      assert.equal(null, err);

      mongo_util.insertDocument(
        db,
        'documents',
        {
            username : users[cookies['usr_cookie']],
            filename : parms['filename'],
            content : parms['content']
        },
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
