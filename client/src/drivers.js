const axios = require('axios');
const faker = require('faker');

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
  .then(function(response) {
    console.log(response.data);
  })
  .catch(function(error) {
  });
}

const x = 1000;
const y = 1000;

let generateAvailability = activity =>
  activity === 1 ? Math.round(Math.random()) : 0;

let makeDriverOnline = (index, maxX, maxY) => {
  let driver = {
    updated_at: new Date(),
    driverId: index,
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    location: {
  	  x: Math.floor(Math.random() * maxX),
  	  y: Math.floor(Math.random() * maxY),
    },
    activity: 1,
    availability: 1,
  };
  return driver;
};

let createOfflineDriver = (index, maxX, maxY) => {

}
getStatusFromDriver({driverId: 10, location: {x: 1, y: 1}, activity: 1, availability: 1});
