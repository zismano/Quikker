const mongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connectToServer: function( callback ) {
	mongoClient.connect("mongodb://52.55.217.118:27017/cars", function( err, db ) {	// AWS EC2 instance 
//    mongoClient.connect( "mongodb://172.17.0.2:27017/cars", function( err, db ) { // docker ip of mongoDB container:mongo port 
//    mongoClient.connect( "mongodb://localhost:27017/cars", function( err, db ) {
      _db = db;
      return callback( err );
    } );
  },
  
  getDb: function() {
    return _db;
  }
};

