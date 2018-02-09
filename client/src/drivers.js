const axios = require('axios');
const faker = require('faker');
const helpers = require('../../helpers/helpers.js');

// gets 2nd argument only after driver finished a ride and became available
function getStatusFromDriver(endpoint, driver, availableAfterRide) {
  axios.get(`http://127.0.0.1:3000/${endpoint}`, {
    params: {
      driverId: driver.driverId,
      location: {
        x: driver.location.x,
    	  y: driver.location.y,
      },
      activity: driver.activity,
      availability: driver.availability,
      message: availableAfterRide,
    }
  })
  .then(res => { 
    if (res.data.message === 'match is found') { 
      handleMatch(driver, res.data.match);
    } else if (res.data.message === `driver ${driver.driverId} waits for a match`) {
      setTimeout(() => {
        getStatusFromDriver('wait', driver)
      }, 5000);
    } else if (res.data.message === 'driver is offline') {
      console.log(`Driver ${driver.driverId} turned offline`);
    }
  })
  .catch(err => { throw err });
}

let handleMatch = (driver, match) => {  //  wait duration and then make available
  let duration = calculateDurationFromDriverToDestination(driver, match); 
  console.log(`Duration of ride of driver: ${driver.driverId} and ${match.userId} is ${Math.round(duration)} minutes`);
  // set time out to make driver available again  
  setTimeout(() => makeDriverAvailableAgain(driver, match), duration * 60 * 1000); //3600*1000
};

let calculateDurationFromDriverToDestination = (driver, match) => {
  let distanceToPassenger = Math.sqrt(Math.pow(driver.location.x - match.srcX, 2) + Math.pow(driver.location.y - match.srcY, 2));
  let distanceSrcToDest = Math.sqrt(Math.pow(match.destX - match.srcY, 2) + Math.pow(match.destY - match.srcY, 2));
  return ((distanceToPassenger + distanceSrcToDest) * helpers.factor / helpers.velocity * 60); 
}

let makeDriverAvailableAgain = (driver, match) => {
  driver.location.x = match.destX;
  driver.location.y = match.destY;
  driver.availability = 1;
  getStatusFromDriver('cars', driver, 'available after ride');
}

let turnDriverStatus = status => {
  let x = status ? Math.floor(Math.random() * helpers.x) : -1;
  let y = status ? Math.floor(Math.random() * helpers.y) : -1;
  let driver = {
    driverId: Math.floor(Math.random() * 10000000) + 1, // 1-10,000,000
    location: {
      x,
      y,
    },
    activity: status,
    availability: status,
  };

  getStatusFromDriver('cars', driver);
};

setInterval(() => {
 // console.log(`creationOfOnlineDriversTime is ${global.creationOfOnlineDriversTime}`);
  turnDriverStatus(1);
  }, helpers.creationOfOnlineDriversTime * 1);

 setInterval(() => turnDriverStatus(0), helpers.creationOfOfflineDriversTime * 1);

let changeDriversInterval = (onlineDriversTime, offlineDriversTime) => {
  helpers.creationOfOnlineDriversTime = onlineDriversTime;
  helpers.creationOfOfflineDriversTime = offlineDriversTime; 
};

module.exports = {
  changeDriversInterval,
};
