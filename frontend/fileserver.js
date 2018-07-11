// imported modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// my modules
var http_util = require('./http_util');
var services = require('./services');

// running parameters
const port = process.argv[2] || 9000;

// current Logged in users
// handeled in the format of {cookie : username}
var users = {};

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);

  // parse URL
  const parsedUrl = url.parse(req.url);

  // extract query parameters
  var parms = http_util.parseParms(parsedUrl.query);
  var cookies = http_util.parseCookies(req);
    
  // check if this is a restricted service
  if(services.isUnauthorized(cookies, req.url)) {
       res.writeHead(407, 'Forbidden', {'Content-Type': 'text/html'});
       res.end('<!doctype html><html><head><title>413</title></head><body>407: Forbidden</body></html>');
  }
  
  // handle app services
  var pathname = "";
  if (parsedUrl.pathname == '/register')
  {
      services.sign_up_request(res, parms);
  }
  else if (parsedUrl.pathname == '/login')
  {
      services.login_request(res, parms);
  }
  else if (parsedUrl.pathname == '/logout')
  {
      services.logout_request(res, parms, cookies);
  }
  else if (
    parsedUrl.pathname == '/save'
    || parsedUrl.pathname == '/upload'
    || parsedUrl.pathname == '/create'
  )
  {
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
        parms = http_util.parseParms(reqBody, 2);

        services.save_request(
            res,
            {
                filename : parms["fname"],
                content : parms["html"]
            },
            cookies,
            true
        );
      });
  }
  else if (parsedUrl.pathname == '/getfile')
  {
      services.load_request(res, {filename : parms["name"]}, cookies)
  }
  else if (parsedUrl.pathname == '/list')
  {
      services.list_request(res, parms, cookies);
  }  
  // this case means the user want a regular html page
  else{
      services.get_request(res, parsedUrl.pathname);
   }
}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);






