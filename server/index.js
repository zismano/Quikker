const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database/indexMongo.js');
const push = require('../helpers/awsPush.js');

const app = express();

app.use(bodyParser.json());

global.surgeRatio = undefined; 

app.get('/bla', (req, res) => {
     //  results = [{name: 'Ofir Zisman', phone: '+14084105813'}, {name: 'Emma Liu', phone:'+14084105813'}]
     //  results.forEach(result => {
    	// console.log(result);
    	// push.sendSMS(result.name, result.phone);
     //  });
});

app.get('/cars', (req, res) => {
// console.log(req);
  console.log(req.query);
  let reqActivity = Number(req.query.activity);
  // check in cache if needs to update, if yes - update cache, send updates to other services, send success to driver
  db.getDriverStatus({driverId: Number(req.query.driverId)}, (err, result) => {
  	if (err) {
  	  throw err;
  	} else if (reqActivity === result.activity && reqActivity) {
	  res.send('Driver is already online');
    } else if (reqActivity === result.activity && !reqActivity) {
	  res.send('Driver is already offline');
	} else if (result.availability === 0) {
	  res.send('Driver has passengers and cannot get offline');
	} else if (((new Date() - result.updated_at) / 1000 / 3600) < 2) { // last update 2 hours ago
	  res.send('Driver may change status every 2 hours and more');
	} else {
	  let driver = createDriver(result.driverId, result.name, result.phone, req.query.location.x, req.query.location.y, req.query.activity, req.query.availability);

	   db.updateDriver(driver, (err, result) => {
	   	if (err) {
	   	  throw err;
	   	} else {
	//   	  // SNS (notification) to Matching/Trips
	//   	  // doSomething()
	   	  if (reqActivity) {
	// //	    res.send('Driver turned online');
	// 		console.log('Driver turned online');
			sendDriverToMatching(driver, res);
		}
	// 	    // if response contains user's info (there's a match) send OK
	// 	  } else {
 //    // 	    res.send('Driver turned offline');
 //    		console.log('Driver turned offline');	
	// 	  } 
	//     }
	//   })
	//  if (!driver.activity) {
	//  	res.send(`${driver.driverId} is no longer active`);
	//  }
	  //sendDriverToMatching(driver, res);	// Matching is service. It sends to service, even if driver became inactive
	}
  })
};
});
})

let sendStatusNumbersToPricing = () => {
  db.countDriversByQuery({ activity: 1 }, (err, activeDrivers) => {
    if (err) {
      throw err;
    }
    db.countDriversByQuery({ availability: 1}, (err, availableDrivers) => {
      if (err) {
        throw err;
      }
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

let sendDriverToMatching = (driver, res) => {
  // if driver became active, he waits to a match
  if (Number(driver.activity)) {
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
      // check in DB/cache that driver not become offline when he waited for a match
      db.getDriverStatus({ driverId: Number(driver.driverId) }, (err, result) => {
      	if (err) {
      	  throw err;
      	} else if (result.activity) {
	      console.log(match.data);
	      res.send(match.data);
      	}
      	sendsAnswerToMatch(Number(driver.driverId), result.activity, result.availability);
      })
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

//sendStatusNumbersToPricing();

// fetch price ratio, compare to previous price ratio and send push notifications to some quantity of offline drivers
app.post('/pricing', (req, res) => {
  console.log(`Surge ratio is ${req.body.data.surgeRatio}`);
  res.send('Success receiving surge ratio');
  // current surge ratio greater than previous surge ratio
  if (global.surgeRatio && global.surgeRatio < req.body.data.surgeRatio) {
  	let ratio = (req.body.data.surgeRatio - global.surgeRatio) * 5;	// *10000 instead of *5
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
    global.creationOfOnlineDriversTime *= 1.1;
    global.creationOfOfflineDriversTime *= 0.9;  
  }
  global.surgeRatio = req.body.data.surgeRatio;   
})

let createDriver = (driverId, name, phone, locationX, locationY, activity, availability) => {
  return ({
  	driverId,
  	name,
  	phone,
  	location: {
  	  x: locationX,
  	  y: locationY,
  	},
  	activity,
  	availability,
  })
}
    // update cache
    // update other services
//    req.get('/')
    // if request was to become offline -> send OK, else, send match
 //    res.send({userId, userLocation, userDestination});	  	
 //  } else {
	// res.send('Request failed due to ...');
 //  }
//db.countByActivity();
//ex.start();

//db.updateDriver(d);

//setInterval(() => sendStatusNumbersToPricing(), 1000);

app.listen(3000);