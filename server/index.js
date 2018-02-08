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

app.get('/bla', (req, res) => {
//     db.countDriversByQuery2();
	db.insertDriver({
	  driverId: 10000000,
	  name: 'Ofir',
	  phone: '03535353',
	  location: { x: 2, y: 7},
	  activity: 1,
	  availability: 0
	});
});

app.get('/cars', (req, res) => {
  console.log(req.query);
  let message = req.query.message; // defined only if driver becomes available 
  let reqActivity = Number(req.query.activity);
  // check status of driver
  db.getDriverStatus( {driverId: Number(req.query.driverId) }, (err, result) => {
  	if (err) {
  	  throw err;
  	} else if (!message && reqActivity === result.activity && reqActivity) {
	  res.send('Driver is already online');
    } else if (!message && reqActivity === result.activity && !reqActivity) {
	  res.send('Driver is already offline');
	} else if (!message && result.activity && Number(result.availability) === 0) {
	  res.send('Driver has passengers and cannot get offline');
	} else if (!message && ((new Date() - result.updated_at) / 1000 / 3600) < 2) { // last update 2 hours ago
	  res.send('Driver may change status every 2 hours and more');
	} else {
	  let location = JSON.parse(req.query.location);
	  let driver = helpers.createDriver(result.driverId, result.name, result.phone, location.x, location.y, req.query.activity, req.query.availability);
	  db.updateDriver(driver, (err, result) => {
	    if (err) {
	   	  throw err;
	   	} else {
		  sendDriverToMatching(driver, res);
		  }
	    })
      };
   });
});

let sendStatusNumbersToPricing = () => {
 // let startTime = new Date();
  db.countDriversByQuery({ activity: 1 }, (err, activeDrivers) => {
    if (err) {
      throw err;
    }
    db.countDriversByQuery({ availability: 1}, (err, availableDrivers) => {
      if (err) {
        throw err;
      }
 //     console.log(`Duration: ${(new Date() - startTime) / 1000}s, active: ${activeDrivers} available: ${availableDrivers}`);
      axios.post('http://127.0.0.1:4000/pricing', {
        params: {
          activeDrivers,
          availableDrivers,
          message: 'updated status',
        },
      })
      .then(results => {
      	console.log(results.data);
      })
	  .catch(err => {
	  	throw err;
	  });            
    })
  });
}
//sendStatusNumbersToPricing();
//setInterval(() => sendStatusNumbersToPricing(), 1000);

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
      	if (err) {
      		throw err;
      	} else {
     	  console.log(`Insert ${driver.driverId} id to matching cache, duration: ${(new Date - start) / 1000}s`);     		
      	}
      });
    })
    .catch(err => {
  	  throw err;
    });
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
  .then(result => {
	console.log(result.data);
  })
  .catch(err => {
	throw err;
  })	
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
  let ratio = req.body.data.surgeRatio || 1;
  // current surge ratio greater than previous surge ratio
  if (helpers.surgeRatio && helpers.surgeRatio < ratio) {
  	ratio = (ratio - helpers.surgeRatio) * 6;	// *10000 instead of *6
    // send push notifications to X offline drivers
  	db.getOfflineDrivers(ratio, (err, results) => {
      if (err) {
        throw err;
      }
      results.forEach(result => {
    	console.log(result);
    	push.sendSMS(result.name, result.phone);
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
  drivers.changeDriversInterval(helpers.creationOfOnlineDriversTime, helpers.creationOfOfflineDriversTime); 
})

app.get('/wait', (req, res) => {
   // check in cache for match of driver
   //console.log('Req query is:',req.query);
   let start = new Date();
   cache.redisClient.hgetall(req.query.driverId, function(err, object) {
     if (err) {
     	throw err;
     }
     console.log(`Duration check if ${req.query.driverId} is in cache: ${(new Date() - start) / 1000}s`);
   //  console.log(object);
   //  console.log(`DestX: ${object.destX}, DestY: ${object.destY}`);
     let data = {};
     data.message = `driver ${req.query.driverId} waits for a match`;
     if (!object) {
  	   res.send(data);	// sending to driver indication that he is waiting to match
     } else { // match
     // delete match from cache
     cache.redisClient.del(req.query.driverId);
     // get driver's status
     db.getDriverStatus({ driverId: Number(req.query.driverId) }, (err, result) => {
      if (err) {
        throw err;
      } else if (result.activity) {	// driver hasn't become offline
         // send match to driver
        data.message = 'match is found';
        data.match = object;
	    res.send(data);	// send details of user to driver
	     // update driver's status to not available
	     let driver = helpers.createDriver(req.query.driverId, result.name, result.phone, object.destX, object.destY, 1, 0);
	      db.updateDriver(driver, (err, result) => {
	   		if (err) {
	   	      throw err;
	   	    } else {
	   	      console.log(`Driver ${driver.driverId} has become unavailable`);
	   	    }
	      }); 
        // if offline
         // send res to driver with message 'driver <driverId> is offline'
      	} else {
		  data.message = 'driver is offline';       	  
		  res.send(data);	
      	}
      	// send matching ok for match // offline  to matching
      	sendsAnswerToMatch(Number(req.query.driverId), result.activity, result.availability);
      })
     }
   });
});

app.listen(3000);

module.exports = app;