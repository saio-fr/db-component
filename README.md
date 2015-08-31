Database ORM Component for MS-SAIO
==========================================
cDB is a ms-saio component integration for Sequelize so if you want to use it you should read [the doc](http://docs.sequelizejs.com/en/latest/) !

Attributes :
------------
* `sequelize : Sequelize`
* `model : Object as { [Sequelize.Model.name] : [Sequelize.Model]}`
    the Model.name is the first arg of sequelize.define(), check Model Handling for more info.

Methods :
---------
No method except standard start/stop.

Options :
---------
* dialect : 'mysql' || 'mariadb' || 'sqlite' || 'postgres' || 'mssql', default to 'postgres'
* user : default to `null`
* password : default to `null`
* host : default to 'localhost'
* port : default to 5432
* dbname : default to 'database'
* storage : sqlite only, path, default to './database.sqlite'
* model : model folder or file path, can be used multiple times to handle several paths.

Model Handling :
----------------
All models are loaded during component instanciation. They must be node.js module files, and their module.exports must have the following signature :
```javascript
module.exports = function(sequelize, DataTypes) {
  return sequelize.define("aModelName", {
    // sequelize options
  });
};
```

If a model has a class method onload, it will be called with the component instance as argument after all models are imported. The model would look like that :
```javascript
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Company', {
    'name' : DataTypes.STRING
  }, {
    'classMethods': {
      'onload' : function(cDB) {
        var models = cDB.model;
        models.Company.hasMany(models.User);
        models.Company.hasMany(models.Project);
      }
    }
  });
};
```

Example :
---------
To run the example you need ms-saio & docker.  
The test component accepts as options :  
* -h : postgresql host (default to localhost)
* -p : postgresql port (default to 5432)

In test/db, the start.sh script launch 2 containers :  
* one launching a postgresql db on port 5432
* the other launching a phppgadmin on port 50002

To install & run in local :
```bash
    $ cd path/to/cDB
    $ npm install
    $ cd ./test/db
    $ sh start.sh
    $ cd ..
    $ ms-saio test.js
      # check test.js for options & default user, db, host ... values
      # feel free to check the result at http://localhost:50002/
      # user : "postgres" / password : "test"
    $ cd db
    $ sh stop.sh
```
