var siege = require('siege');

siege()
  .on(3000)
  .for(10000).times
  .get('/cars', {siege: true})
  .attack()

siege()
  .on(3000)
  .for(10000).times
  .post('/pricing')
  .attack()

siege()
  .on(3000)
  .for(10000).times
  .get('/wait', {siege: true})
  .attack()


