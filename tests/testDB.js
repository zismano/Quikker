var mongoUtil = require('../database/mongoUtil.js');
var mongo = require('../database/indexMongo.js');
var cache = require('../database/indexRedis.js');
var helpers = require('../helpers/helpers.js');
var expect = require('chai').expect;

describe('Databases', function() {

  describe('MongoDB', function() {

    let driver = helpers.createDriver(1, "John Smith", "654-1111", 30, 50, 1, 0);

    it('inserts a driver', function(done) {
      mongoUtil.connectToServer( function( err ) {
        var db = mongoUtil.getDb();
        var collection = db.db('cars').collection('testCol');
        collection.insert(driver, (err, result) => {
          expect(result.insertedCount).to.equal(1);
          done();
        })
      })
    })

    it('reads a driver by id, if no match returns null', function(done) {
      mongoUtil.connectToServer( function( err ) {
        var db = mongoUtil.getDb();
        var collection = db.db('cars').collection('testCol');
        collection.drop((err, result) => {
          if (err) throw err;      
          mongo.getDriverStatus({driverId: 1}, collection, (err, result) => {
            if (err) throw err;
            expect(result).to.equal(null);
            collection.insert(driver, (err, result) => {
              if (err) throw err;
              mongo.getDriverStatus({driverId: 1}, collection, (err, result) => {
                if (err) throw err;
                expect(result.name).to.equal("John Smith");            
                done();      
              });
            });
          });
        });
      });
    });

    it('updates a driver by id', function(done) {
      mongoUtil.connectToServer( function( err ) {
        var db = mongoUtil.getDb();
        var collection = db.db('cars').collection('testCol');
        let newDriver = { 
          updated_at: new Date(),
          driverId: 1,
          name: "Jane Smith",
          phone: "999-9999",
          location: {
            x: 900,
            y: 1,
          },
          activity: 0,
          availability: 0,
        };
        mongo.updateDriver(newDriver, collection, (err, result) => {
          if (err) throw err;
          mongo.getDriverStatus({driverId: 1}, collection, (err, newresult) => {
            if (err) throw err;
            expect(newresult.name).to.equal("Jane Smith");
            done();   
          });
        });
      });
    });

    it('counts active drivers', function(done) {
      mongoUtil.connectToServer( function( err ) {
        var db = mongoUtil.getDb();
        var collection = db.db('cars').collection('testCol');
        collection.drop((err, result) => {
          if (err) throw err;
          let driver2 = helpers.createDriver(2, "Number 2", "543-222", 5, 999, 1, 0);
          let driver3 = helpers.createDriver(3, "Number 3", "543-333", 3, 222, 1, 1);
          let driver4 = helpers.createDriver(4, "Number 4", "543-444", 55, 111, 0, 0);
          collection.insert([driver2, driver3, driver4], (err, result) => {
            if (err) throw err;
            mongo.countDriversByQuery({activity: 1}, collection, (err, count) => {
              if (err) throw err;
              expect(count).to.equal(2);
              done();
            });
          });
        });   
      });
    });

    it('returns maximum number of offline drivers given as input', function(done) {
      mongoUtil.connectToServer( function( err ) {
        var db = mongoUtil.getDb();
        var collection = db.db('cars').collection('testCol');
        collection.drop((err, result) => {
          if (err) throw err;
          let driver2 = helpers.createDriver(2, "Number 2", "543-222", 5, 999, 1, 0);
          let driver3 = helpers.createDriver(3, "Number 3", "543-333", 3, 222, 1, 1);
          let driver4 = helpers.createDriver(4, "Number 4", "543-444", 55, 111, 0, 0);
          let driver5 = helpers.createDriver(5, "Number 5", "543-555", 43, 21, 0, 0);
          let driver6 = helpers.createDriver(6, "Number 6", "543-666", 22, 11, 0 ,0);
          collection.insert([driver2, driver3, driver4, driver5, driver6], (err, result) => {
            if (err) throw err;
            mongo.getOfflineDrivers(10, collection, (err, array) => {
              if (err) throw err;
              expect(array.length).to.equal(3);
              done();
            })
          })
        })   
      });
    })
  });
  
  describe('Redis', function() {
    it('inserts and reads a match', function(done) {
      cache.redisClient.hmset([
        99999, 
        "userId", 3, 
        "srcX", 50, 
        "srcY", 100, 
        "destX", 60, 
        "destY", 90
      ], (err, result) => {
        if (err) throw err;
        cache.redisClient.hgetall(99999, (err, object) => {
          if (err) throw err;
          expect(Number(object.userId)).to.equal(3);
          done();
        });
      });
    });

    it('deletes a match', function(done) {
      cache.redisClient.del(99999, (err, result) => {
        if (err) throw err;
        expect(result).to.equal(1);
        cache.redisClient.del(99999, (err, result) => {
          if (err) throw err;
          expect(result).to.equal(0);
          cache.redisClient.hgetall(99999, (err, object) => {
            if (err) throw err;
            expect(object).to.equal(null);
            done();
          })
        })
      });   
    });
  });
});