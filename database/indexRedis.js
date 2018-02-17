var redis = require('redis');
//var redisClient = redis.createClient({host : 'localhost', port : 6379});
//var redisClient = redis.createClient({host : '172.17.0.3', port : 6379}); // docker ip of redis container
var redisClient = redis.createClient({host : '54.147.203.101', port : 6379}); // EC2 ip of redis container


redisClient.on('ready',function() {
 console.log("Redis is ready");
});

redisClient.on('error',function() {
 throw "Error in Redis";
});

// helper function for populating cache
let createMatch = (driverId) => {
  let obj = {
    driverId,
	userId: driverId,
	srcX: Math.floor(Math.random() * 1000),
	srcY: Math.floor(Math.random() * 1000),
	destX: Math.floor(Math.random() * 1000),
	destY: Math.floor(Math.random() * 1000),
  }
  return obj;
}

// just for testing cache!
let populateCache = (driverId, start) => {
  let match = createMatch(driverId);
  redisClient.hmset([
  	driverId, 
  	"userId", match.userId, 
  	"srcX", match.srcX,
  	"srcY", match.srcY,
  	"destX", match.destX,
  	"destY", match.destY
  ], function (err, res) {
  	if (err) {
      throw err;
  	} else if (driverId === 1000000) {
      console.log(`Populate cache with ${driverId} docs in ${(new Date - start) / 1000}s`);
  	} else {
  	  if (driverId % 100000 === 0) {
  	    console.log(`Entered ${driverId} docs`);
  	  }
  	  populateCache(driverId + 1, start);
  	}
  });
};

populateCache(1, new Date());

module.exports = {
  redisClient,
};
