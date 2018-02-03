const mongoClient = require('mongodb').MongoClient;
const faker = require('faker');

const url = "mongodb://localhost:27017/";

const db = mongoClient.connect(url);

// populate DB with 10M rows and afterwards, creating 2 indexes for better query performance
let populateDB = function(start, end, duration) {
  // insert batches of 50K records to database
  let batch = 50000;
  populateDrivers(start * batch, end * batch, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      start++;
      // make it 200 times (recursive call to function)
      if (start === 200) {
        console.log(`Duration ${(new Date() - duration) / 1000} s`);
        db.then(db => {
          const dbase = db.db('cars');
          const collection = dbase.collection('drivers');
          // creating index of activity
          collection.createIndex("activity", (err, result) => {
            if (err) {
              console.log(err);
              return;
            } else {
              console.log('Add index activity');
              // creating index of availability
              collection.createIndex("availability", (err, result) => {
                if (err) { 
                  console.log(err);
                } else {
                  console.log('Add index availability');
                  return;            
                }
              });
            }
          });
        });
      } else {
        populateDB(start, start + 1, duration);      
      } 
    }
  })
}

// populates drivers collection with 50K rows
let populateDrivers = (index, documentNumber, callback) => {
	db.then(db => {
	  const dbase = db.db('cars');   
	  const collection = dbase.collection('drivers');
	  const batchNumber = documentNumber - index;
	  const start = new Date();
	  let batchDocuments = [];
	  while (index < documentNumber) {
	    let driver = createDriver(index + 1, x, y);
	    batchDocuments[index % batchNumber] = driver;
	    if ((index + 1) % batchNumber === 0) {
	      collection.insert(batchDocuments, (err, result) => {
	        if (err) {
	          console.log(err);
	        } else {
	          batchDocuments = [];
	          callback(null, result);
	        }
	      });
	    }
	    index++;
	    if (index % 100000 === 0) {
	      console.log(`Inserted ${index} documents.`);
	    }
	  }
	//  db.close();
	});
};

let generateAvailability = activity =>
  activity === 1 ? Math.round(Math.random()) : 0;

// given an index and maximal grid indexes, create a fake driver
let createDriver = (index, maxX, maxY) => {
  const activity = Math.round(Math.random());
  let driver = {
    updated_at: faker.date.between('2017-11-01', '2018-02-01'),
    driverId: index,
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    location: {
  	  x: Math.floor(Math.random() * maxX),
  	  y: Math.floor(Math.random() * maxY),
    },
    activity,
    availability: generateAvailability(activity),
  };
  return driver;
};

const x = 1000;
const y = 1000;

// invocation of population of DB
populateDB(0, 1, new Date());