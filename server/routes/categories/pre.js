var path = require('path');
var sanitizer = require(path.join('..', '..', 'sanitizer'));
var config = require(path.join(__dirname, '..', '..', '..', 'config'));

module.exports = {
  requireLogin: function(request, reply) {
    if (config.loginRequired) { return reply(request.auth.isAuthenticated); }
    else { return reply(true); }
  },
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    return reply();
  }
};
