// modules
var crypto = require("crypto");

// running parameters
const maxParms = 10;
const cookieLength = 20;

// Parse HTTP parms
exports.parseParms = function(query)
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

// parse HTTP cookies
exports.parseCookies = function(request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

// create a HTTP cookie
exports.createCookie = function(request) {
    return crypto.randomBytes(cookieLength).toString('hex');
}
