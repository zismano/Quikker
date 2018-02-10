let updateDriver = (driver, collection, callback) => {
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
          callback(null, result);
        }
      }
  );
};

// to count active or available drivers e.g {activity: 1}
let countDriversByQuery = (params, collection, callback) => {
  collection.find(params).count((err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

let getDriverStatus = (params, col, callback) => {
  col.findOne(params, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

// gets 10,000 offline drivers (to send them notifications if surge ratio is high)
let getOfflineDrivers = (num, collection, callback) => {
  collection.find({activity: 0}, {"limit": num}).toArray((err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  updateDriver,
  countDriversByQuery,
  getDriverStatus,
  getOfflineDrivers,
};

// 1s each
//countDriversByQuery({activity: 1, availability: 0}, 'cars', 'drivers');
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

// let getDriverStatus = (params, database, col, callback) => {
//   db.then(db => {
//     var start = new Date();
//     var collection = db.db(database).collection(col);
//     collection.find(params, { "activity": 1, "availability": 1}, (err, result) => {
//       if (err) {
//   //      callback(err);
//       } else {
//    //     callback(null, result);
//         console.log(`Duration: ${(new Date() - start) / 1000}s`);
//       }
//     });
//   })
//   .catch(err => { throw err });
// }


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
