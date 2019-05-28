var _ = require('lodash');
var path = require('path');
var localModules = require(path.normalize(__dirname + '/../../../modules/include'));
var modulesDir = path.normalize(__dirname + '/../../../modules');
var modulesNMDir = path.normalize(__dirname + '/../../../modules/node_modules');
var localModulesDir = path.normalize(__dirname + '/../../../modules');
var modules = {};

modules.install = (db) => {
  var master = {
    db: db,
    routes: [],
    common: [],
    authorization: [],
    apiMethods: {},
    hooks: {},
    plugins: [],
    parsers: [],
    initMethods: [],
    permissions: {
      defaults: {},
      validations: {},
      layouts: {}
    },
  };

  // get a list of all modules in modules/package.json
  var packageJson = require(path.normalize(modulesDir + '/package.json'));
  var ept_modules = packageJson.dependencies;

  // extract code from modules
  for (var moduleName in ept_modules) {
    modules.load(path.normalize(modulesNMDir + '/' + moduleName), master);
  }

  // extract code from local modules
  localModules.forEach(function(moduleName) {
    modules.load(path.normalize(localModulesDir + '/' + moduleName), master);
  });

  // return collection of code from modules
  return master;
};

modules.load = (dir, master) => {
  // load the index.js for the given moduleName
  var module = require(dir);
  var name = module.name;

  // Module Routes
  if (module.routes && module.routes.length > 0) {
    master.routes = master.routes.concat(module.routes);
  }

  // Module Common methods
  if (module.common && module.common.length > 0) {
    master.common = master.common.concat(module.common);
  }

  // Module Authorization methods
  if (module.authorization && module.authorization.length > 0) {
    master.authorization = master.authorization.concat(module.authorization);
  }

  // Module DB Methods
  if (module.db && _.isArray(module.db)) {
    module.db.forEach(function(item) { master.db[item.name] = item.data; });
  }
  else if (module.db) { master.db[name] = module.db; }

  // Module hooks
  if (module.hooks && _.isArray(module.hooks)) {
    module.hooks.forEach(function (hook) {
      var hookEndpoint = _.get(master.hooks, hook.path);
      if (hookEndpoint) { hookEndpoint.push(hook.method); }
      else { _.set(master.hooks, hook.path, [hook.method]); }
    });
  }

  if (module.plugins) {
    master.plugins = master.plugins.concat(module.plugins);
  }

  if (module.parser) {
    master.parsers = master.parsers.concat(module.parser);
  }

  // Module Permissions as an Array
  if (module.permissions && _.isArray(module.permissions)) {
    module.permissions.forEach(function(item) {
      if (item.data.defaults) { master.permissions.defaults[item.name] = item.data.defaults; }
      if (item.data.validation) { master.permissions.validations[item.name] = item.data.validation; }
      if (item.data.layout) { master.permissions.layouts[item.name] = item.data.layout; }
    });
  }

  // Module Permssion Defaults
  if (module.permissions && module.permissions.defaults) {
    master.permissions.defaults[name] = module.permissions.defaults;
  }

  // Module Permission validation methods
  if (module.permissions && module.permissions.validation) {
    master.permissions.validations[name] = module.permissions.validation;
  }

  // Module init methods
  if (module.init) { module.init(); }

  // Module Permission layouts
  if (module.permissions && module.permissions.layout) {
    master.permissions.layouts[name] = module.permissions.layout;
  }
};

exports.install = modules.install;

exports.register = (server, options, next) => {
  server = server || {};
  options = options || {};
  var db = options.db || {};
  // load all the code from each module installed
  var output = modules.install(db);
  server.app.moduleData = output;
  return next();
};

exports.register.attributes = {
  name: 'modules',
  version: '1.0.0'
};
