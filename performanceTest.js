var siege = require('siege');

siege()
  .on(3000)
  .for(10000).times
  .concurrent(25)
  .get('/cars', {siege: true})
  .attack()

// siege()
//   .on(3000)
//   .for(10000).times
//   .get('/cars', {driverId: 5, location: { x: 10, y: 20}, activity: 1, availability: 1})
//   .attack()

// siege()
//   .on(3000)
//   .for(10000).times
//   .post('/pricing')
//   .attack()


