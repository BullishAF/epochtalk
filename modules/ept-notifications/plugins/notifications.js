// Load modules
var _ = require('lodash');

var db, websocketAPIKey;

// Use websocket
var path = require('path');
var socket = require(path.join(__dirname, '../../../websocket'));

exports.register = function (plugin, options, next) {
  if (!options.db) { return next(new Error('No db found in notifications')); }
  db = options.db;

  if (!options.config) { return next(new Error('No config found in notifications')); }
  websocketAPIKey = options.config.websocketAPIKey;

  plugin.expose('spawnNotification', spawnNotification);
  plugin.expose('systemNotification', systemNotification);
  next();
};

exports.register.attributes = {
  name: 'notifications',
  version: '1.0.0'
};

function spawnNotification(datas) {
  var cloneDatas = _.cloneDeep(datas);
  return db.notifications.create(cloneDatas)
  .tap(function() {
    systemNotification(datas);
  });
}

function systemNotification(datas) {
  var options = {
    APIKey: websocketAPIKey,
    channel: JSON.stringify(datas.channel),
    data: datas.data
  };
  socket.emit('notify', options);
}
