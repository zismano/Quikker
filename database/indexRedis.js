var redis = require('redis');
var redisClient = redis.createClient({host : 'localhost', port : 6379});

redisClient.on('ready',function() {
 console.log("Redis is ready");
});

redisClient.on('error',function() {
 console.log("Error in Redis");
});

redisClient.hmset([1, "availability", 1, "activity", 1, "locationX", 738 ,"locationY", 286], function (err, res) {});
redisClient.hmset([2, "availability", 1, "activity", 1, "locationX", 2, "locationY", 2], function (err, res) {});
redisClient.hmset([4, "availability", 0, "activity", 1, "locationX", 159 ,"locationY", 559], function (err, res) {});
