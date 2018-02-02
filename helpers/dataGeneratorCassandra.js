const cassandra = require('cassandra-driver');
const faker = require('faker');

//Connect to the cluster
const client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });

let insertBatch = (times, startTime) => {
  let queries = [];
  const query = "INSERT INTO ks_drivers.drivers \
    (updated_at, driverId, name, phone, location, availability, activity) \
    VALUES (?,?,?,?,?,?,?)";
  const batch = 300;  // low quantity in batch, because of primary key (collision with update queries)
  for (let i = times * batch; i < (times + 1) * batch; i++) {
    let driver = createDriver(i + 1, x, y);
    let params = [
      driver.updated_at,
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
   if (err) {
    console.log(`Error: ${err}`)
   } else {
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

let generateAvailability = activity =>
  activity === 1 ? Math.round(Math.random()) : 0;

// given an index and maximal grid indexes, create a fake driver
let createDriver = (index, maxX, maxY) => {
  const activity = Math.round(Math.random());
  let driver = {
    updated_at: faker.date.between('2017-11-01', '2018-02-01'),
    driverId: index,
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    location: {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    },
    activity,
    availability: generateAvailability(activity),
  };
  return driver;
};

const x = 1000;
const y = 1000;

// invocation of population of DB
insertBatch(0, new Date());