var mongo = require('../database/indexMongo.js');
var helpers = require('../helpers/helpers.js')
var expect = require('chai').expect;

describe('MongoDB', function() {

  let driver = helpers.createDriver(1, "John Smith", "654-1111", 30, 50, 1, 0);

  it('inserts a driver', function(done) {
    mongo.db.then(db => {
      var collection = db.db('cars').collection('drivers');
      collection.insert(driver, (err, result) => {
        expect(result.insertedCount).to.equal(1);
        done();
     })
    })
  })

  it('reads a driver by id', function(done) {
    mongo.db.then(db => {
      var collection = db.db('cars').collection('drivers');
      collection.drop((err, result) => {
        if (err) throw err;      
        mongo.getDriverStatus({driverId: 1}, (err, result) => {
          if (err) throw err;
          expect(result).to.equal(null);
          collection.insert(driver, (err, result) => {
            if (err) throw err;
            mongo.getDriverStatus({driverId: 1}, (err, result) => {
              if (err) throw err;
              expect(result.name).to.equal("John Smith");            
              done();      
            })
          })
        })
      })
    })
  })

  it('updates a driver by id', function(done) {
    mongo.db.then(db => {
      var collection = db.db('cars').collection('drivers');
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
      mongo.updateDriver(newDriver, (err, result) => {
        if (err) throw err;
        mongo.getDriverStatus({driverId: 1}, (err, newresult) => {
          if (err) throw err;
          expect(newresult.name).to.equal("Jane Smith");
          done();   
        });
      });
    });
  });

  it('counts active drivers', function(done) {
    mongo.db.then(db => {
      var collection = db.db('cars').collection('drivers');
      collection.drop((err, result) => {
        if (err) throw err;
        let driver2 = helpers.createDriver(2, "Number 2", "543-222", 5, 999, 1, 0);
        let driver3 = helpers.createDriver(3, "Number 3", "543-333", 3, 222, 1, 1);
        let driver4 = helpers.createDriver(4, "Number 4", "543-444", 55, 111, 0, 0);
        collection.insert([driver2, driver3, driver4], (err, result) => {
          if (err) throw err;
          mongo.countDriversByQuery({activity: 1}, (err, count) => {
            if (err) throw err;
            expect(count).to.equal(2);
            done();
          })
        })
      })   
    });
  })

  it('returns array of offline drivers', function(done) {
   mongo.db.then(db => {
      var collection = db.db('cars').collection('drivers');
      collection.drop((err, result) => {
        if (err) throw err;
        let driver2 = helpers.createDriver(2, "Number 2", "543-222", 5, 999, 1, 0);
        let driver3 = helpers.createDriver(3, "Number 3", "543-333", 3, 222, 1, 1);
        let driver4 = helpers.createDriver(4, "Number 4", "543-444", 55, 111, 0, 0);
        let driver5 = helpers.createDriver(5, "Number 5", "543-555", 43, 21, 0, 0);
        let driver6 = helpers.createDriver(6, "Number 6", "543-666", 22, 11, 0 ,0);
        collection.insert([driver2, driver3, driver4, driver5, driver6], (err, result) => {
          if (err) throw err;
          mongo.getOfflineDrivers(10, (err, array) => {
            if (err) throw err;
            expect(array.length).to.equal(3);
            done();
          })
        })
      })   
    });
  })
});

//describe('Redis', function() {

// database
  // redis
    // insert match
    // read match
    // delete match


// server
  // GET /cars
  // POST to /pricing
  // POST to /available/cars
  // POST /pricing
  // GET /wait

// client side?
  // GET /cars
  // GET /wait

