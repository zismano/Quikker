// const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/drivers');

// const db = mongoose.connection;

// let driverSchema = mongoose.Schema({
//   location: [{ x: Number, y: Number }],
//   activity: Boolean,
//   availability: Boolean,
// }); 

// const Driver = mongoose.model('Driver', driverSchema);
var mongoClient = require('mongodb').MongoClient;

let createDriver = (driver, index) => {
  driver._id = index + 1;   
  driver.location = {};
  driver.activity = Math.round(Math.random());
  driver.availability = (driver.activity === 1) ? Math.round(Math.random()) : 0;
  driver.location.x = Math.round(Math.random() * 1000);
  driver.location.y = Math.round(Math.random() * 1000);
  return driver;
};

// populates drivers collection with 50K rows
let populateDrivers = (index, documentNumber, callback) => {
  mongoClient.connect('mongodb://localhost:27017/', function(err, db) { 
    var dbase = db.db('cars'); //here
    var collection = dbase.collection('drivers');
    const batchNumber = documentNumber - index;
    const start = new Date();
    let batchDocuments = [];
    while (index < documentNumber) {
      let driver = createDriver({}, index);
      batchDocuments[index % batchNumber] = driver;
      if ((index + 1) % batchNumber === 0) {
        collection.insert(batchDocuments, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            batchDocuments = [];
            callback(null, result);
          }
        });
      }
      index++;
      if (index % 100000 === 0) {
        console.log(`Inserted ${index} documents.`);
      }
    }
    console.log(`Inserted  ${documentNumber} in (${(new Date() - start) / 1000.0}) s`);
  //  db.close();
  });
};

let updateDriver = (driver) => {

  db.drivers.update(
    { '_id': driver._id },
    { 'location.x': driver.location.x,
      'location.y': driver.location.y,
      'availability': driver.availability,
      'activity': driver.activity }
	)
};

module.exports = {
  createDriver,
  populateDrivers,
};
