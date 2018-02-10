const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index.js');
const helpers = require('../helpers/helpers.js');
const mongo = require('../database/indexMongo.js');
const cache = require('../database/indexRedis.js');
const faker = require('faker');
var mongoUtil = require('../database/mongoUtil.js');

chai.use(chaiHttp);

const expect = chai.expect;

describe('GET requests', function() {

 describe('/cars', function() {
 
  it('should send driver details to /cars', function(done) {
  	let driver = helpers.createDriver(11, "John Doe", "654-333", 50, 100, 1, 0);
    mongoUtil.connectToServer( function( err ) {
      var db = mongoUtil.getDb();
      var collection = db.db('cars').collection('testCol');
  		collection.insert(driver, (err, result) => {
	      let driver2 = helpers.createDriver(11, "John Doe", "654-333", 200, 300, 1, 1);
        driver2.test = true;
		  chai.request(server)
			  .get('/cars')
			  .query(driver2)
			  .end(function (err, res) {
  				 collection.remove({driverId: 11}, () => done());
			     expect(err).to.be.null;
			     expect(res).to.have.status(200);
			     expect(res.request.qs).to.eql(driver2);
			  });  	
  		})
  	})
  })

  it('should notify that driver is already online, according to his status', function(done) {
  	let driver = helpers.createDriver(11, "John Doe", "654-333", 20, 300, 1, 0);
   	mongoUtil.connectToServer( function( err ) {
      var db = mongoUtil.getDb();
      var collection = db.db('cars').collection('testCol');
  		collection.insert(driver, (err, result) => {
	      let driver2 = helpers.createDriver(11, "John Doe", "654-333", 250, 350, 1, 1);
        driver2.test = true;
		  chai.request(server)
			  .get('/cars')
			  .query(driver2)
			  .end(function (err, res) {
  				 collection.remove({driverId: 11}, () => done());
			     expect(res.text).to.eql('Driver is already online');
			  });  	
  		})
  	})
  })

  it('should notify that driver is already offline, according to his status', function(done) {
  	let driver = helpers.createDriver(11, "John Doe", "654-333", 20, 300, 0, 0);
   	mongoUtil.connectToServer( function( err ) {
      var db = mongoUtil.getDb();
      var collection = db.db('cars').collection('testCol');
  		collection.insert(driver, (err, result) => {
	      let driver2 = helpers.createDriver(11, "John Doe", "654-333", 100, 100, 0, 0);
        driver2.test = true;
		  chai.request(server)
			  .get('/cars')
			  .query(driver2)
			  .end(function (err, res) {
  				 collection.remove({driverId: 11}, () => done());
			     expect(res.text).to.eql('Driver is already offline');
			  });  	
  		})
  	})
  });

  it('should notify when driver is unavailable, when he tries to get offline', function(done) {
  	let driver = helpers.createDriver(11, "John Doe", "654-333", 20, 300, 1, 0);
   	mongoUtil.connectToServer( function( err ) {
      var db = mongoUtil.getDb();
      var collection = db.db('cars').collection('testCol');
  		collection.insert(driver, (err, result) => {
	      let driver2 = helpers.createDriver(11, "John Doe", "654-333", 100, 100, 0, 0);
        driver2.test = true;
		  chai.request(server)
			  .get('/cars')
			  .query(driver2)
			  .end(function (err, res) {
			     expect(res.text).to.eql('Driver has passengers and cannot get offline');
  				 collection.remove({driverId: 11}, () => done());
			  });  	
  		})
  	})
  }) 	

  it('should notify when driver tries to change status too often', function(done) {
  	let driver = helpers.createDriver(11, "John Doe", "654-333", 20, 300, 0, 0);
   	mongoUtil.connectToServer( function( err ) {
      var db = mongoUtil.getDb();
      var collection = db.db('cars').collection('testCol');
  		collection.insert(driver, (err, result) => {
	      let driver2 = helpers.createDriver(11, "John Doe", "654-333", 100, 100, 1, 1);
        driver2.test = true;
		  chai.request(server)
			  .get('/cars')
			  .query(driver2)
			  .end(function (err, res) {
			     expect(res.text).to.eql('Driver may change status every 2 hours and more');
  				 collection.remove({driverId: 11}, () => done());
			  });  	
  		})
  	})
  })

 it('should notify when driver is sent to matching', function(done) {
  	let driver = {
      updated_at: faker.date.between('2017-11-01', '2018-02-01'),
      driverId: 11,
      name: "John Doe",
      phone: "654-333",
      location: {
  	    x: 20,
  	    y: 300,
      },
      activity: 0,
      availability: 0,
    };
   	mongoUtil.connectToServer( function( err ) {
      var db = mongoUtil.getDb();
      var collection = db.db('cars').collection('testCol');
  		collection.insert(driver, (err, result) => {
	      let driver2 = helpers.createDriver(11, "John Doe", "654-333", 100, 100, 1, 1);
        driver2.test = true;
		  chai.request(server)
			  .get('/cars')
			  .query(driver2)
			  .end(function (err, res) {
			  	res.text = JSON.parse(res.text)
			     expect(res.text.message).to.eql(`driver 11 waits for a match`);
           collection.remove({driverId: 11}, () => done());

			  });  	
  		})
  	})
  })
 })

 describe('/wait', function() {   // when there's still no match
  it('should send message to driver when still there\'s no match', function(done) {
   let driver = helpers.createDriver(11, "Jane Doe", "654-111", 11, 1, 1, 1);
   cache.redisClient.del(11, (err, result) => {
  	 chai.request(server)
  	   .get('/wait')
  	   .query(driver)
  	   .end(function (err, res) {
  	     expect(err).to.be.null;
  	     expect(res).to.have.status(200);
  	     expect(res.body.message).to.eql('driver 11 waits for a match');
  	     done();	              	
  	   });
   })
  }) 

  // when found match
  it('should send message to driver when match was found', function(done) {
    let driver = helpers.createDriver(11, "Jane Doe", "654-111", 11, 1, 1, 1);
  	mongoUtil.connectToServer( function( err ) {
      var db = mongoUtil.getDb();
      var collection = db.db('cars').collection('testCol');
  		collection.insert(driver, (err, result) => {
		  cache.redisClient.hmset([
            11, 
            "userId", 3, 
            "srcX", 50, 
            "srcY", 100, 
            "destX", 60, 
            "destY", 90
          ], (err, result) => {
            if (err) throw err;
           driver.test = true;
	         chai.request(server)
	          .get('/wait')
	          .query(driver)
	          .end(function (err, res) {
	            expect(err).to.be.null;
	            expect(res).to.have.status(200);
                cache.redisClient.del(11, (err, result) => {
	              expect(res.body.message).to.eql('match is found');
				        collection.remove({driverId: 11}, () => done());	              	
	            });
	          });  	
   		  }) 
		  });
     });
   });
 });
}) 

describe('POST request', function() {
  it('should get surge ratio posted from /pricing', function(done) {
    chai.request(server)
      .post('/pricing')
      .end(function(err, res) {
      	expect(err).to.be.null;
      	expect(res).to.have.status(200);
      	done();
      });
  })
});
