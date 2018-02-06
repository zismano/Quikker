const axios = require('axios');
const faker = require('faker');

global.creationOfOnlineDriversTime = 1;
global.creationOfOfflineDriversTime = 1;
global.velocity = 25; // mph
global.factor = 0.001;  

// offline driver can turn to online and available
// online driver and available can turn to offline
// gets 2nd argument only after driver finished a ride and became available
function getStatusFromDriver(driver, availableAfterRide) {
  axios.get('http://127.0.0.1:3000/cars', {
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
    console.log(res.data);
    if (res.data.userId) {  // if response contains user's info (there's a match)
      handleMatch(driver, res.data);
    }
  })
  .catch(err => {
    throw err;
  });
}

let handleMatch = (driver, match) => {
  //  wait duration and then available
  // sqrt( (x2-x1)^2 + (y2-y1)^2 ) 
  let distanceToPassenger = Math.sqrt(Math.pow(driver.location.x - match.srcLocation.x, 2) + Math.pow(driver.location.y - match.srcLocation.y, 2));
  let distanceSrcToDest = Math.sqrt(Math.pow(match.destLocation.x - match.srcLocation.x, 2) + Math.pow(match.destLocation.y - match.srcLocation.y, 2))
  let duration = (distanceToPassenger + distanceSrcToDest) * global.factor / global.velocity * 60;
  console.log(`Duration of ride of driver: ${driver.driverId} and ${match.userId} is ${duration} minutes`);
  // set time out to make driver available again
  // when setTimeout is dome, driver needs to become available again, update database and send availability to matcihng/trips   
  setTimeout(() => makeDriverAvailableAgain(driver, match), duration * 60 * 1000); //3600*1000
}

let makeDriverAvailableAgain = (driver, match) => {
  driver.location.x = match.destLocation.x;
  driver.location.y = match.destLocation.y;
  driver.availability = 1;
  getStatusFromDriver(driver, 'available after ride');
}

const x = 1000;
const y = 1000;

// let generateAvailability = activity =>
//   activity === 1 ? Math.round(Math.random()) : 0;

// let makeDriverOnline = (index, maxX, maxY) => {
//   let driver = {
//     updated_at: new Date(),
//     driverId: index,
//     name: faker.name.findName(),
//     phone: faker.phone.phoneNumber(),
//     location: {
//   	  x: Math.floor(Math.random() * maxX),
//   	  y: Math.floor(Math.random() * maxY),
//     },
//     activity: 1,
//     availability: 1,
//   };
//   return driver;
// };

let turnDriverInactive = () => {
  let driver = {
    driverId: Math.floor(Math.random() * 10000000) + 1, // 1-10,000,000
    location: {
      x: -1,
      y: -1,
    },   
    activity: 0,
    availability: 0,
  };
  getStatusFromDriver(driver); 
};

// randomize driverId, and make driver online if he was offline
let turnDriverActive = () => {  
  let driver = {
    driverId: Math.floor(Math.random() * 10000000) + 1, // 1-10,000,000
    location: {
      x: Math.floor(Math.random() * x),
      y: Math.floor(Math.random() * y),
    },   
    activity: 1,
    availability: 1,
  };
  getStatusFromDriver(driver);
};

setInterval(() => {
  console.log(`creationOfOnlineDriversTime is ${global.creationOfOnlineDriversTime}`);
  turnDriverActive();
  }, global.creationOfOnlineDriversTime * 100);

setInterval(() => turnDriverInactive(), global.creationOfOfflineDriversTime * 100);

let changeDriversInterval = (onlineDriversTime, offlineDriversTime) => {
  global.creationOfOnlineDriversTime = onlineDriversTime;
  global.creationOfOfflineDriversTime = offlineDriversTime;
}; 


//getStatusFromDriver({driverId: 36, location: {x: 1, y: 1}, activity: 1, availability: 1});

module.exports = {
  changeDriversInterval,
}


