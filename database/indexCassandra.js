const cassandra = require('cassandra-driver');

//Connect to the cluster
const client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });

let insertDriver = (driver, callback) => {
  const query = "INSERT INTO ks_drivers.drivers \
    (driverId, name, phone, location, availability, activity) \
    VALUES (?,?,?,?,?,?)";
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
      callback(err);
    } else {
      callback(null, results);
    }
  });
};


let updateDriver = driver => {
  const query = "UPDATE ks_drivers.drivers SET \
    name = ?, phone = ?, location = ?, availability = ?, activity = ? \
    WHERE driverId = ?";
  const params = [
    driver.name,
    driver.phone,
    { x: driver.location.x, y: driver.location.y },
    driver.availability,
    driver.activity,
    driver.driverId,
  ];
  client.execute(query, params, { prepare: true }, (err, results) => {
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      console.log(`Insert: ${results}`);
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
  driverId: 2,
  name: 'Shi',
  phone: '4321',
  location: { x: 33, y: 999 },
  availability: 0,
  activity: 1,
};
//insertDriver(d);
//  updateDriver(d);
//loadDrivers();

let insertMany = (startTime, num) => {
  if (num === 100) {
    console.log(`Finished inserting ${num} records in ${(new Date() - startTime) / 1000}s`);
  } else {
    let driver = {
      driverId: num,
      name: 'ab cd',
      phone: '12-34',
      location: {
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000),
      },
      availability: Math.round(Math.random()),
      activity: Math.round(Math.random()),
    };
    insertDriver(driver, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        insertMany(startTime, num + 1);
      }
    });
  }
};

insertMany(new Date(), 0);


