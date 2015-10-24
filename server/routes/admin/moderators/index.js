var path = require('path');
var moderators = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/moderators', config: moderators.add },
  { method: 'DELETE', path: '/moderators', config: moderators.remove },
];
