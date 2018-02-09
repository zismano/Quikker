// creating global variables
const x = 1000;
const y = 1000;
let creationOfOnlineDriversTime = 100;
let creationOfOfflineDriversTime = 100;
const velocity = 25; // mph
const factor = 0.001;
let surgeRatio;
const numDrivers = 10000000;

let createDriver = (driverId, name, phone, locationX, locationY, activity, availability) => {
  return ({
  	updated_at: new Date(),
  	driverId: Number(driverId),
  	name,
  	phone,
  	location: {
  		x: Number(locationX),
  		y: Number(locationY),
  	},
  	activity: Number(activity),
  	availability: Number(availability),
  })
}

let generateAvailability = activity =>
  activity === 1 ? Math.round(Math.random()) : 0;

let createRandomDriver = (driverId, maxX, maxY) => {
  const activity = Math.round(Math.random()); 
  return ({
    updated_at: new Date(),
    driverId,
    location: {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),      
    },
    activity,
    availability: generateAvailability(activity),
    message: undefined,
  })
}

module.exports = {
  x,
  y,
  creationOfOnlineDriversTime,
  creationOfOfflineDriversTime,
  velocity,
  factor,
  surgeRatio,
  createDriver,
  createRandomDriver,
  generateAvailability,
  numDrivers,
}
