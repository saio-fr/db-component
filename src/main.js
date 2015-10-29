/*-------------------------------------------------*\
 |                                                 |
 |      /$$$$$$    /$$$$$$   /$$$$$$   /$$$$$$     |
 |     /$$__  $$  /$$__  $$ |_  $$_/  /$$__  $$    |
 |    | $$  \__/ | $$  \ $$   | $$   | $$  \ $$    |
 |    |  $$$$$$  | $$$$$$$$   | $$   | $$  | $$    |
 |     \____  $$ | $$__  $$   | $$   | $$  | $$    |
 |     /$$  \ $$ | $$  | $$   | $$   | $$  | $$    |
 |    |  $$$$$$/ | $$  | $$  /$$$$$$ |  $$$$$$/    |
 |     \______/  |__/  |__/ |______/  \______/     |
 |                                                 |
 |                                                 |
 |                                                 |
 |    *---------------------------------------*    |
 |    |   © 2015 SAIO - All Rights Reserved   |    |
 |    *---------------------------------------*    |
 |                                                 |
\*-------------------------------------------------*/

var util = require('util');
var path = require('path');
var fs = require('fs');
var Sequelize = require('sequelize');
var when = require('when');
var _ = require('underscore');

function isJsFile(filePath) {
  return path.extname(filePath) === '.js';
}

function getFunctions(array) {
  return _.filter(array, function(value) {
    return _.isFunction(value);
  });
}

// parse an array of files and folders to get all the .js files in them (with absolute path)
function getJSFiles(paths) {
  return _.chain(paths)
  .filter(function(aPath) {
    return _.isString(aPath);
  })
  .map(function(aPath) {
    if (!path.isAbsolute(aPath)) {
      return path.resolve(process.env.PWD, aPath);
    }
    return aPath;
  })
  .reduce(function(jsFiles, aPath) {
    if (isJsFile(aPath)) {
      jsFiles.push(aPath);
    } else if (fs.statSync(aPath).isDirectory()) {
      var subJsFiles = _.chain(fs.readdirSync(aPath))
        .filter(isJsFile)
        .map(function(aSubPath) {
          return path.join(aPath, aSubPath);
        })
        .value();
      jsFiles = jsFiles.concat(subJsFiles);
    }
    return jsFiles;
  }, [])
  .value();
}

var Db = function(container, options) {
  _.defaults(options, {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    dbname: 'database',
    model: [],
    autoSync: true
  });

  if (!_.isArray(options.model)) {
    options.model = [options.model];
  }

  var sequelize = new Sequelize(options.dbname, options.user, options.password, {
    host: options.host,
    port: options.port,
    dialect: options.dialect,
    pool: {
      min: 0,
      max: 5,
      idle: 10000
    }
  });

  // model import/load
  var models = {};
  var modelPaths = getJSFiles(options.model);
  var modelConstructors = getFunctions(options.model);
  _.each(modelPaths, function(modelPath) {
    var model = sequelize.import(modelPath);
    models[model.name] = model;
  });
  _.each(modelConstructors, function(constructor) {
    var model = constructor(sequelize, sequelize.Sequelize);
    models[model.name] = model;
  });

  // for now, sequelize is public
  this.sequelize = sequelize;
  this.model = models;
  this.autoSync = options.autoSync;

  // models .onload classmethod calls (useful for association mainly)
  var that = this;
  _.each(models, function(model) {
    if ('onload' in model) {
      model.onload(that);
    }
  });
};

Db.prototype.start = function() {
  var that = this;
  return that.sequelize.authenticate()
  .then(function() {
    if (that.autoSync) {
      return that.sync();
    }
    return when.resolve();
  });
};

// useful only if multiple Db instances
Db.prototype.stop = function() {
  // sadly sequelize.close does not return a promise.
  this.sequelize.close();
  return when.resolve().delay(1000);
};

Db.prototype.sync = function() {
  return this.sequelize.sync();
};

module.exports = Db;
