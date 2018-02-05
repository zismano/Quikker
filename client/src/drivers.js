const axios = require('axios');
const faker = require('faker');

global.creationOfOnlineDriversTime = 1;
global.creationOfOfflineDriversTime = 1;

// offline driver can turn to online and available
// online driver and available can turn to offline
function getStatusFromDriver(driver) {
  axios.get('http://127.0.0.1:3000/cars', {
    params: {
      driverId: driver.driverId,
      location: {
        x: driver.location.x,
    	  y: driver.location.y,
      },
      activity: driver.activity,
      availability: driver.availability,
    }
  })
  .then(res => {
    console.log(res.data);
    // if response contains user's info (there's a match) send OK
  })
  .catch(err => {
    throw err;
  });
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

//setInterval(turnDriverActive, global.creationOfOnlineDriversTime);
setInterval(turnDriverInactive, global.creationOfOfflineDriversTime);


//getStatusFromDriver({driverId: 2, location: {x: 1, y: 1}, activity: 1, availability: 1});
