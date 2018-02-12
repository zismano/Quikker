const newrelic = require('newrelic');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongo = require('../database/indexMongo.js');
const cache = require('../database/indexRedis.js');
const push = require('../helpers/awsPush.js');
const helpers = require('../helpers/helpers.js');
const app = require('express')();
const mongoUtil = require('../database/mongoUtil.js');

app.use(bodyParser.json());

mongoUtil.connectToServer( function( err ) {
  var db = mongoUtil.getDb();

  // app.get('/', (req, res) => {
  //   let start = new Date();
  //   const col = db.db('cars').collection(helpers.driversCol);
  //    mongo.countDriversByQuery({ activity: 1, availability: 1 }, col, (err, activeDrivers) => {
  //     if (err) throw err;
  //     mongo.countDriversByQuery({ availability: 1, availability: 0 }, col, (error, availableDrivers) => {
  //       if (error) throw err;
  //       console.log(`Duration: ${(new Date() - start) / 1000}s`);  
  //     })
  //   })
  //  res.send('HEY');
  // });

  app.get('/cars', (req, res) => {
    let { query } = req;	// ES6 message = req.message
    query = !query.driverId ? helpers.createRandomDriver(Math.floor(Math.random() * helpers.numDrivers) + 1, helpers.x, helpers.y) : query; 	// for stress test only
    let { message } = query // defined only if driver becomes available 
    let reqActivity = Number(query.activity);
    let collection = query.test ? 'testCol' : helpers.driversCol;
    const col = db.db('cars').collection(collection);
    mongo.getDriverStatus({ driverId: Number(query.driverId) }, col, (err, result) => {
      if (err) throw err;
    	if (!message && reqActivity === result.activity && reqActivity) {
        res.send('Driver is already online');
      } else if (!message && reqActivity === result.activity && !reqActivity) {
        res.send('Driver is already offline');
      } else if (!message && result.activity && !Number(result.availability)) {
  	  res.send('Driver has passengers and cannot get offline');
  	} else if (!message && ((new Date() - result.updated_at) / 1000 / 3600) < 2) { 
  	  res.send('Driver may change status every 2 hours and more');
  	} else {
  	  let driver = helpers.createDriver(result.driverId, result.name, result.phone, query.location.x, query.location.y, query.activity, query.availability);
  	 mongo.updateDriver(driver, col, (err, result) => {
  	   if (err) throw err;
  	  	sendDriverToMatching(driver, res);
  	 })
      };
    });
  });

  let sendStatusNumbersToPricing = (col) => {
    mongo.countDriversByQuery({ activity: 1 }, col, (err, activeDrivers) => {
      if (err) throw err;
      mongo.countDriversByQuery({ availability: 1 }, col, (error, availableDrivers) => {
        if (error) throw err;
        axios.post('http://127.0.0.1:4000/pricing', {
          params: { activeDrivers, availableDrivers, message: 'updated status' },
        })
  	  .catch(err => { throw err });           
      });
    });
  };


  let sendDriverToMatching = (driver, res) => {
    if (Number(driver.activity)) {  // if driver became active, he waits to a match
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
        cache.redisClient.hmset([
        	driver.driverId, 
        	"userId", match.userId, 
        	"srcX", match.srcLocation.x, 
        	"srcY", match.srcLocation.y, 
        	"destX", match.destLocation.x, 
        	"destY", match.destLocation.y
        ], (err, result) => {
        	if (err) throw err;
        });
      })
      .catch(err => { throw err; });
    } else {	// driver is inactive, just post to Matching
    	let params = {
        driverId: driver.driverId,
        activity: driver.activity,
        message: 'Driver is offline',
    	};
    	res.sendStatus(200);
    	axiosPostRequest('http://127.0.0.1:5000/available/cars', params);
    }
  }

  let axiosPostRequest = (url, params) => {
    axios.post(url, { params })
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

  app.post('/pricing', (req, res) => {
    res.send('Success receiving surge ratio');
    let ratio = !req.body.data ? 1 : req.body.data.surgeRatio;	// default to 1 for tests
    if (helpers.surgeRatio && helpers.surgeRatio < ratio) {
    	ratio = (ratio - helpers.surgeRatio) * 6;	// *10000 instead of *6
    	mongo.getOfflineDrivers(ratio, helpers.driversCol, (err, results) => {
        if (err) throw err;
        results.forEach(result => { // send push notifications to X offline drivers
   //   	push.sendSMS(result.name, result.phone);
        });
      });
      // increase creation of online drivers, decrease creation of offline drivers
      helpers.creationOfOnlineDriversTime /= 1.1;
      helpers.creationOfOfflineDriversTime *= 1.1; 
      // if current surge ratio smaller than previous surge ratio, return to normal 
    } else if (helpers.surgeRatio && helpers.surgeRatio >= ratio) {
      helpers.creationOfOnlineDriversTime = helpers.creationOfOfflineDriversTime = 1;     
    }
    helpers.surgeRatio = ratio;
    // drivers.changeDriversInterval(helpers.creationOfOnlineDriversTime, helpers.creationOfOfflineDriversTime); 
  });

  app.get('/wait', (req, res) => {
    let collection = req.query.test ? 'testCol' : helpers.driversCol;
    let col = db.db('cars').collection(collection);
    let { query } = req;	// ES6 message = req.message
    query = !query.driverId ? helpers.createRandomDriver(Math.floor(Math.random() * helpers.numDrivers) + 1, helpers.x, helpers.y) : query; 	// for stress test only
    cache.redisClient.hgetall(query.driverId, function(err, object) {
      if (err) throw err;
      let data = { message: `driver ${query.driverId} waits for a match` };
      if (!object) {
    	  res.send(data);	// sending to driver indication that he is waiting to match
      } else { // match
        cache.redisClient.del(query.driverId);  // delete match from cache
        mongo.getDriverStatus({ driverId: Number(query.driverId) }, col, (err, result) => {
          if (err) throw err;
          else if (result.activity) {	// driver hasn't become offline
            data.message = 'match is found';  // send match to driver
            data.match = object;
  	      res.send(data);	// send details of user to driver
  	      let driver = helpers.createDriver(query.driverId, result.name, result.phone, object.destX, object.destY, 1, 0); // update driver's status to not available
  	      mongo.updateDriver(driver, col, (err, result) => { // updated offline driver
  	   	    if (err) throw err;
  	      });	
        	}
        	sendsAnswerToMatch(Number(query.driverId), result.activity, result.availability);
        })  // send matching ok for match // offline to matching
      }
    });
  });

  setInterval(() => {
 	  sendStatusNumbersToPricing(db.db('cars').collection(helpers.driversCol));
 	  console.log('sending status to pricing');
   }, 3000);
});

app.listen(3000);

module.exports = app;