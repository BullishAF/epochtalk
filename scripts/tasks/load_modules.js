var path = require('path');
var fse = require('fs-extra');
var Promise = require('bluebird');
var modulesDir = path.normalize(__dirname + '/../../modules');
var modulesNMDir = path.normalize(__dirname + '/../../modules/node_modules');
var appModulesDir = path.normalize(__dirname + '/../../app');

module.exports = function() {
  return loadModules()
  .catch(console.log);
};

// 1.) loads the package.json from the /modules dir and retrieves all the deps as modules
// 2.) cleans out the /app/modules dir and ensure that dir exists
// 3.) calls load() on each module
function loadModules() {
  var moduleIncludes = require(path.normalize(modulesDir + '/include'));

  // empty /app dir, ensure /app dir exists
  fse.removeSync(appModulesDir);

  return Promise.each(moduleIncludes, function(key) {
    var moduleDir = path.normalize(modulesDir + '/' + key);
    return load(moduleDir, key);
  });
}

// 1.) checks if each module has a client dir
// 2.) if it exists, symlink to /app/modules/{moduleName}
// 3.) symlink any HTML files if they exists
function load(moduleDir, moduleName) {
  // require module
  var thisModule = require(moduleDir);
  // load the index.js for the given moduleName
  var inDir = path.normalize(moduleDir + '/client');

  // Figure out where to put the client files
  var outDir; // TODO: check if there is more than one frontend-core
  if (thisModule.type === 'frontend-core') { outDir = appModulesDir; }
  else { outDir = appModulesDir + '/modules/' + moduleName; }

  // copy client files if they exists
  return checkDir(inDir)
  .then((exists) => {
    if (exists) { return linkDir(inDir, outDir); }
    else { return exists; }
  });
}

// check if client dir exists and is a directory
function checkDir(inDir) {
  return new Promise(function(resolve) {
    fse.stat(inDir, function(err, stats) {
      if (err || !stats.isDirectory()) { return resolve(false); }
      else { return resolve(true); }
    });
  });
}

// copies one dir to another dir
// symlinks do not get traversed in the symlink task
function linkDir(inDir, outDir) {
  return new Promise(function(resolve, reject) {
    fse.copy(inDir, outDir, function(err) {
      if (err) { return reject(err); }
      else { return resolve(); }
    });
  });
}
