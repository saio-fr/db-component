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

var Db = require('../db.js');
var when = require('when');
var path = require('path');

var ExampleDb = function(container, options) {
  var that = this;

  that.db = container.use('db', Db, {
    user: 'postgres',
    password: 'test',
    dialect: 'postgres',
    host: options.h ? options.h : 'localhost',
    port: options.p ? options.p : '5432',
    dbname: 'postgres',
    model: ['model', './model2/Project.js', path.resolve(process.env.PWD, 'model3')]
  });
};

ExampleDb.prototype.start = function() {
  var User = this.db.model.User;
  var Project = this.db.model.Project;
  var Company = this.db.model.Company;
  var saio;
  var lily;
  var jc;
  var mich;

  // create some instances
  return when.all([
      Company.create({ name: 'saio' })
        .then(function(_saio) {
          saio = _saio;
        }),
      Project.create({ name: 'lily' })
        .then(function(_lily) {
          lily = _lily;
        }),
      User.create({ name: 'jc' })
        .then(function(_jc) {
          jc = _jc;
        }),
      User.create({ name: 'mich' })
        .then(function(_mich) {
          mich = _mich;
        })

    // create associations
    ]).then(function() {
      return when.all([
          saio.addUser(jc),
          saio.addUser(mich),
          saio.addProject(lily),
          lily.addUser(jc),
          lily.addUser(mich)
        ]);

    // run a test query
    }).then(function() {
      return User.findAll({
          where: {
            CompanyId: saio.id
          }
        });

    // check the result
    }).then(function(users) {
      if (users.length !== 2 ||
          users[0].name !== 'jc' && users[0].name !== 'mich' ||
          users[1].name !== 'jc' && users[1].name !== 'mich' ||
          users[0] === users[1]) {
        return when.reject(new Error('test failed: cannot find saio employees'));
      }
      return when.resolve();

    }).then(function() {
      console.log('it SAUL GOODMAN !');
    });
};

module.exports = ExampleDb;
