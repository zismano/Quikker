var cassandra = require('cassandra-driver');
var async = require('async');

 //Connect to the cluster
var client = new cassandra.Client({contactPoints: ['127.0.0.1'], keyspace: 'demo'});

// Read users and print to console
   function doSomething(callback) {
       client.execute("SELECT lastname, age, city, email, firstname FROM users WHERE lastname='Jones'", function (err, result) {
           if (!err){
               if ( result.rows.length > 0 ) {
                   var user = result.rows[0];
                   console.log("name = %s, age = %d", user.firstname, user.age);
               } else {
                   console.log("No results");
               }
           }
           else {
           	console.log(err);
           }
 
           // Run next function in series
  //         callback(err, null);
       });
   }

   doSomething();
