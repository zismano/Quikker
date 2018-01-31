var cassandra = require('cassandra-driver');
var async = require('async');

 //Connect to the cluster
var client = new cassandra.Client({contactPoints: ['127.0.0.1']});

let insert = post => {
  let query = "INSERT INTO ks_drivers.drivers (driverId, name, phone, location_x, location_y, availability, activity) VALUES (?,?,?,?,?,?,?)";
  client.execute(query,[post.driverId, post.name, post.phone, post.location_x, post.location_y, post.availability, post.activity], {prepare: true}, function(err, results){
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      console.log(`Insert: ${results}`);
    }
  };)
}

let updateContact = post => {
  let query = "UPDATE ks_drivers.drivers SET name = ?, phone = ?, location_x = ?, location_y = ?, availability = ?, activity = ? WHERE driverId = ?";
  client.execute(query, [post.name, post.phone, post.location_x, post.location_y, post.availability, post.activity, post.driverId], {prepare: true}, function(err, results){
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      console.log(`Insert: ${results}`);
    }  
  });
}

let loadContacts = query => {
//         var post = req.body;
  var query = "SELECT * FROM ks_drivers.drivers";
    // if(typeof(query.email) != "undefined"){
    //   query += " WHERE email = '"+req.query.email+"'";
    // }
    client.execute(query, [], function(err, results) {
      console.log(results.rows);
    });
}

var p = {
  email: 'pazit@gmail.com',
  name: 'pazit who?',
  phone: '444-444',
  address: 'shenkin',
  city: 'Tel Aviv'
}

var d = {
  driverId: 1,
  name: 'Shifshif',
  phone: '4321',
  location_x: 33,
  location_y: 999,
  availability: 0,
  activity: 1
}
// insert(d);
//  updateContact(d);
loadContacts();

// updateContact(p);
//   loadContacts();

