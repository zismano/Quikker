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
  let start = new Date();
  collection.find(params).count((err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
      console.log(`Duration from mongo: ${(new Date() - start) / 1000}s`);
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