const mongoClient = require('mongodb').MongoClient;
//const helpers = require('../helpers/dataGeneratorMongo.js');

const url = "mongodb://localhost:27017/";

const db = mongoClient.connect(url);

let updateDriver = (driver, callback) => {
  let start = new Date();
  db.then(db => {
    var dbase = db.db('cars');
    var collection = dbase.collection('drivers');
    collection.update(
      { driverId: driver.driverId },
      { updated_at: new Date(),
        driverId: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        location: {
          x: driver.location.x,
          y: driver.location.y,
        },
        activity: driver.activity,
        availability: driver.availability }, (err, result) => {
          if (err) {
            callback(err);
          } else {
            console.log(`Update time: ${(new Date() - start) / 1000} s`);
            callback(null, result);
          }
        }
    )
  })
  .catch(err => {
    console.log(err);
  })
};

// result of query with 
const driver = {
  driverId: 99999,
  name: 'Good Weekend',
  phone: '650 000 0000',
  location: {
    x:50,
    y:100
  },
  activity: 1,
  availability: 1
};

//updateDriver(driver);
// In mongoDB shell after invoking updateDriver(driver)
//> db.drivers.find({driverId: 99999});
//{ "_id" : ObjectId("5a74fc734d2421c019a75c40"), "updated_at" : ISODate("2018-02-03T00:10:16.979Z"), "driverId" : 99999, "name" : "Good Weekend", "phone" : "650 000 0000", "location" : { "x" : 50, "y" : 100 }, "activity" : 1, "availability" : 1 }


// to count active or available drivers e.g {activity: 1}
let countDriversByQuery = (params, callback) => {
  let start = new Date();
  db.then(db => {
    var dbase = db.db('cars');
    var collection = dbase.collection('drivers');
    collection.find(params).count((err, result) => {
      if (err) {
        console.log(err);
        callback(err);
      } else {
        console.log(`Result:${result}, duration:${(new Date - start) / 1000}s`);
        callback(null, result);
      }
    });
  })
  .catch(err => {
    console.log(err);
  });
}

let getDriverStatus = (params, callback) => {
  db.then(db => {
    var dbase = db.db('cars');
    var collection = dbase.collection('drivers');
    collection.findOne(params, (err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  })
  .catch(err => {
    console.log(err);
  });
}



//> db.drivers.find({activity: 1}).count();
//4999210 // number of online drivers


// takes 10s??????
let countByActivity = () => {
  let start = new Date();
  db.then(db => {
    var dbase = db.db('cars');
    var collection = dbase.collection('drivers');
    collection.aggregate([
        {
          $group: {
            _id: "$activity",
            count: { $sum: 1 }
          }
        }
      ]).toArray(function(err, results) {
        if (err) {
          console.log(`Error: ${err}`);          
        } 
        else {
          console.log(`Results: ${results}`);
          console.log(`duration ${(new Date() - start) / 1000}s`);
        }
      });
  })
  .catch(err => {
    console.log(err);
  });
}

//countByActivity();
//countDriversByQuery({activity: 1})

module.exports = {
  db,
  updateDriver,
  countDriversByQuery,
  getDriverStatus
};
