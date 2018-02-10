let expect = require('chai').expect;
let helpers = require('../helpers/helpers.js');

describe('Helper functions', function() {

  describe('generateAvailability function', function() {
  	it('should return 0 if input is 0', function(done) {
  	  expect(0).to.equal(helpers.generateAvailability(0));
  	  done();
  	})
  })

  describe('createRandomDriver function', function() {
  	it('should create a random driver, given an id and maximal coordinates', function(done) {
  		let driver = helpers.createRandomDriver(3, 1000, 1000);
  		expect(driver).to.be.an('object');
  		expect(driver.location).to.have.property('x');
  		expect(driver.location).to.have.property('y');
  		expect(driver).to.have.property('updated_at');
  		expect(driver.message).to.equal(undefined);
  		expect(driver).to.have.property('activity');
  		expect(driver).to.have.property('availability');
  		done();
  	})
  })    
});