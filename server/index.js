const newrelic = require('newrelic');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const db = require('../database/indexMongo.js');
const cache = require('../database/indexRedis.js');
const push = require('../helpers/awsPush.js');
const helpers = require('../helpers/helpers.js');

const app = express();

app.use(bodyParser.json());

app.get('/cars', (req, res) => { 
  if (req.query.siege) {	// only for stress tests
  	req.query = helpers.createRandomDriver(Math.floor(Math.random() * 10000000) + 1, 
  	helpers.x, helpers.y);
  }
 // let driver2 = helpers.createDriver(11, "John Doe", "654-333", 100, 100, 0, 0);
 // driver2.test = true;
 // req.query = driver2;
  let message = req.query.message; // defined only if driver becomes available 
  let reqActivity = Number(req.query.activity);
  let database = req.query.test ? 'testDB' : 'cars';
  let col = req.query.test ? 'testCol' : 'drivers';
  // check status of driver
  db.getDriverStatus( {driverId: Number(req.query.driverId) }, database, col, (err, result) => {
  	if (err) { throw err;
    } else if (!message && reqActivity === result.activity && reqActivity) {
	  res.send('Driver is already online');
    } else if (!message && reqActivity === result.activity && !reqActivity) {
	  res.send('Driver is already offline');
	} else if (!message && result.activity && !Number(result.availability)) {
	  res.send('Driver has passengers and cannot get offline');
	} else if (!message && ((new Date() - result.updated_at) / 1000 / 3600) < 2) { // last update 2 hours ago
	  res.send('Driver may change status every 2 hours and more');
	} else {
	  //let location = JSON.parse(req.query.location);
	  let location = req.query.location;
	  let driver = helpers.createDriver(result.driverId, result.name, result.phone, location.x, location.y, req.query.activity, req.query.availability);
	  db.updateDriver(driver, database, col, (err, result) => {
	    if (err) throw err;
	   	else {
		  sendDriverToMatching(driver, res);
		}
	  })
    };
  });
});

let sendStatusNumbersToPricing = (database, col) => {
  db.countDriversByQuery({ activity: 1 }, database, col, (err, activeDrivers) => {
    if (err) throw err;
    db.countDriversByQuery({ availability: 1}, database, col, (err, availableDrivers) => {
      if (err) throw err;
      axios.post('http://127.0.0.1:4000/pricing', {
        params: {
          activeDrivers,
          availableDrivers,
          message: 'updated status',
        },
      })
	  .catch(err => { throw err });           
    })
  });
}


let sendDriverToMatching = (driver, res) => {
  // if driver became active, he waits to a match
  if (Number(driver.activity)) {
  	let data = {};
  	data.message = `driver ${driver.driverId} waits for a match`;
  	res.send(data);	// sending to driver indication that he is waiting to match
    axios.get('http://127.0.0.1:5000/available/cars', {
      params: {
        driverId: driver.driverId,
        name: driver.name,
        phone: driver.phone,
        location: {
          x: driver.location.x,
          y: driver.location.y,
        },
        availability: driver.availability,
        activity: driver.activity,
        message: 'look for a match',
      },
    })
    .then(match => {
      match = match.data;
      let start = new Date();
      // new version -  store match in cache
      cache.redisClient.hmset([
      	driver.driverId, 
      	"userId", match.userId, 
      	"srcX", match.srcLocation.x, 
      	"srcY", match.srcLocation.y, 
      	"destX", match.destLocation.x, 
      	"destY", match.destLocation.y
      ], (err, result) => {
      	if (err) throw err;
      	else {
     	  console.log(`Insert ${driver.driverId} id to matching cache, duration: ${(new Date - start) / 1000}s`);     		
      	}
      });
    })
    .catch(err => { throw err; });
  } else {	// driver is inactive, just post to Matching
  	let params = {
      driverId: driver.driverId,
      activity: driver.activity,
      message: 'Driver is offline',
  	};
  	axiosPostRequest('http://127.0.0.1:5000/available/cars', params);
  }
}

let axiosPostRequest = (url, params) => {
  axios.post(url, {
    params,
  })
  .catch(err => { throw err; })	
};

let sendsAnswerToMatch = (driverId, activity, availability) => {
  let message = Number(activity) ? 'Match' : 'No match';
  let params = {
    driverId,
    activity,
    availability,
    message,
  };
  axiosPostRequest('http://127.0.0.1:5000/available/cars', params);
};

// fetch price ratio, compare to previous price ratio and send push notifications to some quantity of offline drivers
app.post('/pricing', (req, res) => {
 // console.log(`Surge ratio is ${req.body.data.surgeRatio}`);
  res.send('Success receiving surge ratio');
  var ratio;
  if (!req.body.data) {
  	ratio = 1;
  } else {
  	ratio = req.body.data.surgeRatio;
  }
  // current surge ratio greater than previous surge ratio
  if (helpers.surgeRatio && helpers.surgeRatio < ratio) {
  	ratio = (ratio - helpers.surgeRatio) * 6;	// *10000 instead of *6
    // send push notifications to X offline drivers
  	db.getOfflineDrivers(ratio, 'cars', 'drivers', (err, results) => {
      if (err) throw err;
      results.forEach(result => {
 //   	push.sendSMS(result.name, result.phone);
      });
    });
    // increase creation of online drivers, decrease creation of offline drivers
    helpers.creationOfOnlineDriversTime /= 1.1;
    helpers.creationOfOfflineDriversTime *= 1.1; 
    // if current surge ratio smaller than previous surge ratio, return to normal 
  } else if (helpers.surgeRatio && helpers.surgeRatio >= ratio) {
    helpers.creationOfOnlineDriversTime = 1;
    helpers.creationOfOfflineDriversTime = 1;     
  }
  helpers.surgeRatio = ratio;
  // drivers.changeDriversInterval(helpers.creationOfOnlineDriversTime, helpers.creationOfOfflineDriversTime); 
})

app.get('/wait', (req, res) => {
   let start = new Date();
   let database = req.query.test ? 'testDB' : 'cars';
   let col = req.query.test ? 'testCol' : 'drivers';
   cache.redisClient.hgetall(req.query.driverId, function(err, object) {
     if (err) throw err;
     console.log(`Duration check if ${req.query.driverId} is in cache: ${(new Date() - start) / 1000}s`);
     let data = { message: `driver ${req.query.driverId} waits for a match` };
     if (!object) {
  	   res.send(data);	// sending to driver indication that he is waiting to match
     } else { // match
       cache.redisClient.del(req.query.driverId);  // delete match from cache
       db.getDriverStatus({ driverId: Number(req.query.driverId) }, database, col, (err, result) => {
         if (err) throw err;
          else if (result.activity) {	// driver hasn't become offline
        data.message = 'match is found';  // send match to driver
        data.match = object;
	    res.send(data);	// send details of user to driver
	     // update driver's status to not available
	     let driver = helpers.createDriver(req.query.driverId, result.name, result.phone, object.destX, object.destY, 1, 0);
	      db.updateDriver(driver, database, col, (err, result) => {
	   		if (err) throw err;
	   	    console.log(`Driver ${driver.driverId} has become unavailable`);  
	      }); 	
      	}
      	// send matching ok for match // offline  to matching
      	sendsAnswerToMatch(Number(req.query.driverId), result.activity, result.availability);
      })
     }
   });
});

setInterval(() => sendStatusNumbersToPricing('cars', 'drivers'), 4000);

app.listen(3000);

module.exports = app;