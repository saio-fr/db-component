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

var path = require('path');
var when = require('when');
var _ = require('underscore');
var Db = require('../src/main.js');

function defineIntegrator(sequelize, DataTypes) {
  return sequelize.define('Integrator', {
    name: DataTypes.STRING
  });
}

var Test = function(container, options) {
  var dbConfig = {
    dialect: 'postgres',
    host: 'db',
    port: '5432',
    user: 'postgres',
    password: 'test',
    dbname: 'postgres',
    model: [
      'model',
      './model2/Project.js',
      path.resolve(process.env.PWD, 'model3'),
      defineIntegrator
    ]
  };

  if (!_.isUndefined(options.sync)) {
    dbConfig.autoSync = options.sync;
    this.autoSync = options.sync;
  } else {
    this.autoSync = true;
  }

  this.db = container.use('db', Db, dbConfig);
};

Test.prototype.start = function() {
  var that = this;
  if (this.autoSync) {
    return this.test();
  }
  return that.db.sequelize.drop()
  .then(function() {
    return that.db.sync();
  })
  .then(function() {
    return that.test();
  });
};

Test.prototype.test = function() {
  var model = this.db.model;
  var saio;
  var apps2com;
  var lily;
  var jc;
  var bruno;

  // create some instances
  return when.all([
    model.Company.create({ name: 'saio' })
    .tap(function(_saio) {
      saio = _saio;
    }),
    model.Integrator.create({ name: 'apps2com' })
    .tap(function(_apps2com) {
      apps2com = _apps2com;
    }),
    model.Project.create({ name: 'lily' })
    .tap(function(_lily) {
      lily = _lily;
    }),
    model.User.create({ name: 'jc' })
    .tap(function(_jc) {
      jc = _jc;
    }),
    model.User.create({ name: 'bruno' })
    .tap(function(_bruno) {
      bruno = _bruno;
    })
  ])

  // create associations
  .then(function() {
    return when.all([
      saio.addUser(jc),
      saio.addUser(bruno),
      saio.addProject(lily),
      saio.addIntegrator(apps2com),
      lily.addUser(jc),
      lily.addUser(bruno)
    ]);
  })

  // run a test query
  .then(function() {
    return model.User.findAll({
      where: {
        CompanyId: saio.id
      }
    });
  })

  // check the result
  .then(function(users) {
    if (users.length !== 2 ||
        users[0].name !== 'jc' && users[0].name !== 'bruno' ||
        users[1].name !== 'jc' && users[1].name !== 'bruno') {
      return when.reject(new Error('test failed: cannot find saio employees'));
    }
    return when.resolve();
  })

  // run another test query
  .then(function() {
    return model.Integrator.findAll({
      where: {
        CompanyId: saio.id
      }
    });
  })

  // check the result
  .then(function(integrators) {
    if (integrators.length !== 1 ||
        integrators[0].name !== 'apps2com') {
      return when.reject(new Error('test failed: cannot find saio integrator'));
    }
    return when.resolve();
  });
};

module.exports = Test;
