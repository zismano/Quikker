// creating global variables
const x = 1000;
const y = 1000;
let creationOfOnlineDriversTime = 100;
let creationOfOfflineDriversTime = 100;
const velocity = 25; // mph
const factor = 0.001;
let surgeRatio;

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

module.exports = {
  x,
  y,
  creationOfOnlineDriversTime,
  creationOfOfflineDriversTime,
  velocity,
  factor,
  surgeRatio,
  createDriver,
}
