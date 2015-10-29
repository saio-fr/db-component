[![Circle CI](https://circleci.com/gh/saio-fr/database-component.svg?style=svg)](https://circleci.com/gh/saio-fr/database-component)

db-component:
=======================
db-component is an orm component integration for Sequelize. So if you want to use it you should [read the doc](http://docs.sequelizejs.com/en/latest/) !

Attributes :
------------
* `sequelize : Sequelize`
* `model : Object as { [Sequelize.Model.name] : [Sequelize.Model]}`  
    the Model.name is the first arg of sequelize.define(), check *Model Handling* for more info.

Methods :
---------
* `sync()`: synchronize the client with the database.
  * returns: `Promise`


Options :
---------
* dialect : 'mysql' || 'mariadb' || 'sqlite' || 'postgres' || 'mssql', default to 'postgres'
* user : default to `undefined`
* password : default to `undefined`
* host : default to `'localhost'`
* port : default to `5432`
* dbname : default to `'database'`
* autoSync: default to `true`, calls sync at startup.
* model : model folder or file path or a function, or an array of those.  
  if model is or contains a function, its prototype must be:
  * `Sequelize.Model function(sequelize, Datatypes)`

Model Handling :
----------------
All models are loaded during component instanciation. They can be a node.js module files, and their module.exports must have the following signature :
```javascript
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ModelName', {
    // sequelize options
  });
};
```

You can also pass the above-mentioned function directly into options.model.

If a model has a class method onload, it will be called with the db-component instance as argument after all models are imported. The model could look like that :
```javascript
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Company', {
    'name' : DataTypes.STRING
  }, {
    'classMethods': {
      'onload' : function(dbComponent) {
        var models = dbComponent.model;
        models.Company.hasMany(models.User);
        models.Company.hasMany(models.Project);
      }
    }
  });
};
```

Test :
------
* linting/style test :
```bash
$ cd path/to/db-component
$ npm install
$ npm test
```

* "unit" test : (you need docker)
```bash
$ cd path/to/db-component
$ npm run test.integration
# to stop and remove docker containers & images:
$ npm run test.integration.clean
```
