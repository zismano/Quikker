const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
//const path = require('path'); 
const db = require('../database/indexMongo.js');

const app = express();

app.use(bodyParser.json());

//app.use('/', express.static(path.join(__dirname, '../client/dist')));

app.get('/', (req, res) => {
 // 	db.db;

//	db.populateDB(0, 1, new Date());
	// let driver = {
	// 	driverId: 5,
	// 	location: {
	// 		x: 100,
	// 		y: 200
	// 	},
	// 	availability: 1,
	// 	activity: 1
	// };
	// db.updateDriver(db.db, driver);

//	db.updateManyDrivers(0, new Date());
//	console.log('started');
//	dbCass.insertBatch(0, new Date());
 //dbCass.countDriversByQuery("activity"); 
// dbCass.findDriversByQuery("activity");
//	db.countByActivity();

});
//db.db;
//	 db.countByActivity();

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
	} else if (result.availablity === 1) {
	  res.send('Driver has passengers and cannot get offline');
	} else {
	  let driver = createDriver(result.driverId, result.name, result.phone, req.query.location.x, req.query.location.y, req.query.activity, req.query.availability);

	  db.updateDriver(driver, (err, result) => {
	  	if (err) {
	  	  throw err;
	  	} else {
	  	  // SNS (notification) to Matching/Trips
	  	  // doSomething()
	  	  if (reqActivity) {
		    res.send('Driver turned online');
		    // if response contains user's info (there's a match) send OK
            console.log('Hello'); 
		  } else {
     	    res.send('Driver turned offline');	
		  } 
	    }
	  })
    }
  });
});

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
        },
      })
      .then(results => {
      	console.log(results.data);
      })
	  .catch(err => {
	  	throw err
	  });            
    })
  });
}
//sendStatusNumbersToPricing();

// fetch price ratio, compare to previous price ratio and send push notifications to some quantity of offline drivers
app.post('/pricing', (req, res) => {
	console.log(`Surge ratio is ${req.body.data.surgeRatio}`);
	res.send('Success receiving surge ratio');
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


const d = {
  driverId: 5,
  name: 'else',
  phone: '4321',
  location: {
    x:3,
    y:5
  },
  activity: 1,
  availability: 1
};
//db.updateDriver(d);

//setInterval(() => sendStatusNumbersToPricing(), 1000);

app.listen(3000);