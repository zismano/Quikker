var cassandra = require('cassandra-driver');
var async = require('async');

 //Connect to the cluster
var client = new cassandra.Client({contactPoints: ['127.0.0.1']});

let insertDriver = post => {
  const query = "INSERT INTO ks_drivers.drivers \
    (driverId, name, phone, location_x, location_y, availability, activity) \
    VALUES (?,?,?,?,?,?,?)";
  const params = [
    post.driverId, 
    post.name, 
    post.phone, 
    post.location_x, 
    post.location_y, 
    post.availability, 
    post.activity
  ];
  client.execute(query, params, {prepare: true}, function(err, results){
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      console.log(`Insert: ${results}`);
    }
  });
}

let updateDriver = post => {
  const query = "UPDATE ks_drivers.drivers SET \
    name = ?, phone = ?, location_x = ?, location_y = ?, availability = ?, activity = ? \
    WHERE driverId = ?";
  const params = [
    post.name, 
    post.phone, 
    post.location_x, 
    post.location_y, 
    post.availability, 
    post.activity, 
    post.driverId
  ];
  client.execute(query, params, {prepare: true}, function(err, results){
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      console.log(`Insert: ${results}`);
    }  
  });
}

let loadDrivers = query => {
  var query = "SELECT * FROM ks_drivers.drivers";
  client.execute(query, [], function(err, results) {
    console.log(results.rows);
  });
}

var d = {
  driverId: 2,
  name: 'Shifa',
  phone: '4321',
  location_x: 33,
  location_y: 999,
  availability: 0,
  activity: 1
}
// insertDriver(d);
//  updateDriver(d);
//loadDrivers();

