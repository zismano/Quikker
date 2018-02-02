const cassandra = require('cassandra-driver');

//Connect to the cluster
const client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });

let insertDriver = (driver, callback) => {
  const query = "INSERT INTO ks_drivers.drivers \
    (updated_in, driverId, name, phone, location, availability, activity) \
    VALUES (toTimestamp(now()),?,?,?,?,?,?)";
  const params = [
    driver.driverId,
    driver.name,
    driver.phone,
    { x: driver.location.x, y: driver.location.y },
    driver.availability,
    driver.activity,
  ];
  client.execute(query, params, { prepare: true }, (err, results) => {
    if (err) {
    //  callback(err);
    console.log(err);
    } else {
      //callback(null, results);
      console.log(results);
    }
  });
};


let updateDriver = driver => {
  let startTime = new Date();
  const query = "UPDATE ks_drivers.drivers SET \
    updated_in = toTimestamp(now()), location = ?, availability = ?, activity = ? \
    WHERE driverId = ?";
  const params = [
    { x: driver.location.x, y: driver.location.y },
    driver.availability,
    driver.activity,
    driver.driverId,
  ];
  client.execute(query, params, { prepare: true }, (err, results) => {
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      console.log(`Update: ${results}`);
      console.log(`Duration of update a record: ${(new Date() - startTime) / 1000}s`);
    }
  });
};

let loadDrivers = () => {
  const query = 'SELECT * FROM ks_drivers.drivers';
  client.execute(query, [], (err, results) => {
    console.log(results.rows);
  });
};

const d = {
  driverId: 4310,
  name: 'Test this',
  phone: '4321',
  location: { x: 33, y: 999 },
  availability: 1,
  activity: 1,
};

//insertDriver(d);
//  updateDriver(d);
//loadDrivers();

// for insertion of 100K records, it took 21.16s. Too much time... 
let insertMany = (startTime, num) => {
  if (num === 100000) {
    console.log(`Finished inserting ${num} records in ${(new Date() - startTime) / 1000}s`);
  } else {
    let driver = createDriver(num);
    // let driver = {
    //   driverId: num,
    //   name: 'ab cd',
    //   phone: '12-34',
    //   location: {
    //     x: Math.floor(Math.random() * 1000),
    //     y: Math.floor(Math.random() * 1000),
    //   },
    //   availability: Math.round(Math.random()),
    //   activity: Math.round(Math.random()),
    // };
    insertDriver(driver, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        insertMany(startTime, num + 1);
      }
    });
  }
};

let createDriver = num => 
  ({
    driverId: num,
    name: 'ab cd',
    phone: '12-34',
    location: {
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 1000),
    },
    availability: Math.round(Math.random()),
    activity: Math.round(Math.random()),    
  });


// for insertion of 100K records with batches of 400, it took 3s with one primary key (driverId)
// for insertion of 1M records, it took 30s
// for insertion of 10M records, it took 336s
let insertBatch = (times, startTime) => {
  let queries = [];
  const query = "INSERT INTO ks_drivers.drivers \
    (updated_in, driverId, name, phone, location, availability, activity) \
    VALUES (toTimestamp(now()),?,?,?,?,?,?)";
  const batch = 300;  // tried 500, got Error: ResponseError: Batch too large
  for (let i = times * batch; i < (times + 1) * batch; i++) {
    let driver = createDriver(i + 1);
    let params = [
      driver.driverId,
      driver.name,
      driver.phone,
      { x: driver.location.x, y: driver.location.y },
      driver.availability,
      driver.activity,
    ];   
    queries.push({ query, params });
  }
  client.batch(queries, { prepare: true }, function (err) {
   // All queries have been executed successfully
   // Or none of the changes have been applied, check err
   if (err) {
    console.log(`Error: ${err}`)
   } else {
 //     if (times === 25000 - 1) {
      if (times === 33334) {
        console.log(`Insert batch of ${batch * (times + 1)} in ${(new Date() - startTime) / 1000}s`);
        return;
      } else {
        queries = [];
        insertBatch(times + 1, startTime);        
      }
   }
  }); 
}
insertBatch(0, new Date());
//insertMany(new Date(), 0);
//updateDriver(d);

module.exports = {
  insertBatch,
};
