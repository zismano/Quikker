const mongoClient = require('mongodb').MongoClient;

const url = "mongodb://localhost:27017/";

const db = mongoClient.connect(url);

let updateDriver = (driver, callback) => {
  db.then(db => {
    let start = new Date();
    var collection = db.db('cars').collection('drivers');
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
  .catch(err => {throw err})
};

let d = {
  driverId: 10000000,
  name: 'Ofir',
  phone: '03535353',
  location: { x: 2, y: 7},
  activity: 1,
  availability: 0
}



// to count active or available drivers e.g {activity: 1}
let countDriversByQuery = (params, callback) => {
  let start = new Date();
  db.then(db => {
    var collection = db.db('cars').collection('drivers');
    collection.find(params).count((err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log(`Result:${result}, duration:${(new Date - start) / 1000}s`);
        callback(null, result);
      }
    });
  })
  .catch(err => {throw err});
}

// 1s each
//countDriversByQuery({activity: 1, availability: 0});


// 29s with mapReduce
// let countDriversByQuery2 = function() {
//   let start = new Date();
//   db.then(db => {
//     var collection = db.db('cars').collection('drivers');
//     collection.mapReduce(
//       function () {
//           emit(this.availability, 1)
//       },
//       function (key, values) {
//         return Array.sum(values)
//       },
//       { 
//         query: { "activity": 1},
//         out: { inline: 1 }
//       },
//       function (err, result) {
//           if (err) {
//     //        callback(err);
//           } else {
//             console.log(`Duration ${(new Date() - start) / 1000}s`);
//             console.log(result);
//           }
//       }
//     );
//   })
// }
//countDriversByQuery2();



let getDriverStatus = (params, callback) => {
  db.then(db => {
    var collection = db.db('cars').collection('drivers');
    collection.findOne(params, (err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  })
  .catch(err => { throw err });
}

// gets 10,000 offline drivers (to send them notifications if surge ratio is high)
let getOfflineDrivers = (num, callback) => {
  let start = new Date();
  db.then(db => {
    var collection = db.db('cars').collection('drivers');
    collection.find({activity: 0}, {"limit": num}).toArray((err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log(`Duration:${(new Date - start) / 1000}s`);
        callback(null, result);
      }
    });
  })
  .catch(err => { throw err });
}



//> db.drivers.find({activity: 1}).count();

// takes 10s??????
// let countByActivity = () => {
//   let start = new Date();
//   db.then(db => {
//     var collection = db.db('cars').collection('drivers');
//     collection.aggregate([
//         {
//           $group: {
//             _id: "$activity",
//             count: { $sum: 1 }
//           }
//         }
//       ]).toArray(function(err, results) {
//         if (err) {
//           console.log(`Error: ${err}`);          
//         } 
//         else {
//           console.log(`Results: ${results}`);
//           console.log(`duration ${(new Date() - start) / 1000}s`);
//         }
//       });
//   })
//   .catch(err => {
//     console.log(err);
//   });
// }

//countByActivity();
//countDriversByQuery({activity: 1})

// function written only for tests...
// let insertDriver = function(driver, callback) {
//   db.then(db => {
//     let start = new Date();
//     var collection = db.db('cars').collection('drivers');
//     collection.insert(driver, (err, result) => {
//       if err {
//         callback(err);
//       } else {
//         callback(null, result);
//       }
//     }) 
//   })
// }

module.exports = {
  db,
  updateDriver,
  countDriversByQuery,
  getDriverStatus,
  getOfflineDrivers,
 // countDriversByQuery2,
 // insertDriver
};
