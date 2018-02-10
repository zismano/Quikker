const mongoClient = require('mongodb').MongoClient;

var _db;

module.exports = {

  connectToServer: function( callback ) {
    mongoClient.connect( "mongodb://localhost:27017/cars", function( err, db ) {
      _db = db;
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};
