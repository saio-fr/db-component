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

var Sequelize = require('sequelize');
var util = require('util');
var path = require('path');
var fs = require('fs');

// parse an array of files and folders to get all the .js files in them (with absolute path)
function getJSFiles(paths) {
  var files = [];
  paths.forEach(function(aPath) {
    if (!path.isAbsolute(aPath)) {
      aPath = path.resolve(process.env.PWD, aPath);
    }

    if (path.extname(aPath) === '.js') {
      files.push(aPath);
      return;
    }

    if (!fs.statSync(aPath).isDirectory()) {
      return;
    }

    fs.readdirSync(aPath)
      .filter(function(filePath) {
        return path.extname(filePath) === '.js';
      })
      .forEach(function(filePath) {
        filePath = path.join(aPath, filePath);
        files.push(filePath);
      });
  });
  return files;
}

var Db = function(container, options) {
  var that = this;
  var dialect;
  var user;
  var password;
  var host;
  var port;
  var dbname;
  var storage;
  var modelPaths;

  if (options) {
    dialect = options.dialect ? options.dialect : 'postgres';
    user = options.user ? options.user : null;
    password = options.password ? options.password : null;
    host = options.host ? options.host : 'localhost';
    port = options.port ? options.port : '5432';
    dbname = options.dbname ? options.dbname : 'database';
    storage = options.storage ? options.storage : './database.sqlite';
    modelPaths = options.model ? options.model : [];
  } else {
    dialect = 'postgres';
    user = null;
    password = null;
    host = 'localhost';
    port = '5432';
    dbname = 'database';
    storage = './database.sqlite';
    modelPaths = [];
  }

  // get all model files (absolute path) from the file/folder paths array
  if (!util.isArray(modelPaths)) {
    modelPaths = [modelPaths];
  }

  modelPaths = getJSFiles(modelPaths);

  var sequelize = new Sequelize(dbname, user, password, {
    host: host,
    port: port,
    dialect: dialect,
    storage: storage,
    pool: {
      min: 0,
      max: 5,
      idle: 10000
    }
  });

  // model imports
  var models = {};
  var model;
  modelPaths.forEach(function(modelPath) {
    model = sequelize.import(modelPath);
    models[model.name] = model;
  });

  // for now, sequelize is public (used for the call to .transaction())
  that.sequelize = sequelize;
  that.model = models;

  // models association rules (defined as a classmethod .associate(models) in the model)
  Object.keys(models).forEach(function(name) {
    if ('onload' in models[name]) {
      models[name].onload(that);
    }
  });
};

Db.prototype.start = function() {
  var that = this;
  return that.sequelize.authenticate()
    .then(function() {
      return that.sequelize.sync();
    });
};

// useful only if multiple Db instances
Db.prototype.stop = function() {
  var that = this;
  that.sequelize.close();
};

module.exports = Db;
