const mongoClient = require('mongodb').MongoClient;
const faker = require('faker');

const url = "mongodb://localhost:27017/";

const db = mongoClient.connect(url);

// populate DB with 10M rows and afterwards, creating 2 indexes for better query performance
let populateDB = function(start, end, duration, database, collection) {
  // insert batches of 50K records to database
  let batch = 50000;
  populateDrivers(start * batch, end * batch, database, collection, (err, results) => {
    if (err) {
      throw err;
    } else {
      if (++start === 200) {  // make it 200 times (recursive call to function)
        console.log(`Duration ${(new Date() - duration) / 1000} s`);
        db.then(db => {
          const col = db.db(database).collection(collection);
          let columns = (["driverId", "activity", "availability"]);
          addIndexes(col, columns, 0);
        });
      } else {
        populateDB(start, start + 1, duration, database, collection);      
      } 
    }
  })
}

let addIndexes = (collection, columns, numOfIndexInserted) => {
  if (columns.length === numOfIndexInserted) {
    collection.ensureIndex({"activity": 1, "availability": 1}, (err, result) => {
      if (err) throw err;
      console.log('Add multi-index on activity and availability');  
      console.log('Finished adding indexes');
      return;
    });
  } else {
    collection.createIndex(columns[numOfIndexInserted], (err, result) => {
      if (err) {
        throw err;
      } else {
        console.log(`Add index ${columns[numOfIndexInserted]}`);
        addIndexes(collection, columns, numOfIndexInserted + 1);
      }
    })
  }
}

// populates drivers collection with 50K rows
let populateDrivers = (index, documentNumber, database, collection, callback) => {
	db.then(db => {
	  const col = db.db(database).collection(collection);
	  const batchNumber = documentNumber - index;
	  const start = new Date();
	  let batchDocuments = [];
	  while (index < documentNumber) {
	    let driver = createDriver(index + 1, x, y);
	    batchDocuments[index % batchNumber] = driver;
	    if ((index + 1) % batchNumber === 0) {
	      col.insert(batchDocuments, (err, result) => {
	        if (err) {
	          callback(err);
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
//var populate = function() {
  populateDB(0, 1, new Date(), 'cars', 'drivers');
//}
