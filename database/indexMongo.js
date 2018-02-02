const mongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017/";

const db = mongoClient.connect(url);

let createDriver = (driver, index) => {
  driver.driverId = index + 1;   
  driver.location = {};
  driver.activity = Math.round(Math.random());
  driver.availability = (driver.activity === 1) ? Math.round(Math.random()) : 0;
  driver.location.x = Math.round(Math.random() * 1000);
  driver.location.y = Math.round(Math.random() * 1000);
  return driver;
};

let populateDB = function(start, end, duration) {
  // insert batches of 50,000 records to database
  let batch = 50000;
  populateDrivers(start * batch, end * batch, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      start++;
      // make it 200 times (recursive call to function)
      if (start === 200) {
        console.log(`Duration ${(new Date() - duration) / 1000} s`);
        return;
      } 
      populateDB(start, start + 1, duration);
    }
  })
}

// populates drivers collection with 50K rows
let populateDrivers = (index, documentNumber, callback) => {
    db.then(db => {
      const dbase = db.db('cars'); //here  
      const collection = dbase.collection('drivers');
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
    //  db.close();
    });
};

// check latency of each update
let updateManyDrivers = (index, startTime) => {
  let start = new Date();
  if (index === 10000) {  
    let totalDuration = new Date() - startTime; 
    console.log(`Total time: ${totalDuration / 1000}s`);
    console.log(`Requests per second ${10000 / (totalDuration / 1000)}`);
    return;
  } else {
    let driver = createDriver({}, index);
    updateDriver(driver, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Update ${index + 1} record in ${(new Date() - start) / 1000}s`);
  //      index++;
        updateManyDrivers(++index, startTime); 
      }
    })
  }
}

let updateDriver = (driver, callback) => {
  let start = new Date();
  db.then(db => {
    var dbase = db.db('cars');
    var collection = dbase.collection('drivers');
    collection.update(
      { 'driverId': driver.driverId },
      { 'driverId': driver.driverId,
        'location': {
          'x': driver.location.x,
          'y': driver.location.y,
        },
        'activity': driver.activity,
        'availability': driver.availability }, (err, result) => {
          if (err) {
            callback(err);
          } else {
            console.log(`Update time: ${(new Date() - start) / 1000} s`);
            callback(null, result);
          }
        }
    )
  });
};



module.exports = {
  updateDriver,
  populateDB,
  updateManyDrivers,
  db,
};
