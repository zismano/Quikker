// const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/drivers');

// const db = mongoose.connection;

// let driverSchema = mongoose.Schema({
//   location: [{ x: Number, y: Number }],
//   activity: Boolean,
//   availability: Boolean,
// }); 

// const Driver = mongoose.model('Driver', driverSchema);

let createDriver = () => {
  let driver = {};
  driver.location = [];
  driver.location[0] = {};
  driver.activity = Math.round(Math.random());
  driver.availability = (driver.activity === 1) ? Math.round(Math.random()) : 0;
  driver.location[0].x = Math.round(Math.random() * 1000);
  driver.location[0].y = Math.round(Math.random() * 1000);
  return driver;
};
// populates drivers collection with 10M rows
let populateDrivers = () => {
  const documentNumber = arg1;
  const batchNumber = 5 * 1000;
  const start = new Date();
  let batchDocuments = [];
  let index = 0;
  while (index < documentNumber) {
    let driver = createDriver();
    driver._id = index + 1;
    batchDocuments[index % batchNumber] = driver;
    if ((index + 1) % batchNumber === 0) {
      db.drivers.insert(batchDocuments);
    }
    index++;
    if (index % 100000 === 0) {
      print(`Inserted ${index} documents.`);
    }
  }
  print(`Inserted  ${documentNumber} in (${(new Date() - start) / 1000.0}) s`);
};

populateDrivers();
