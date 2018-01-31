const express = require('express');
const bodyParser = require('body-parser');
//const path = require('path');
//const db = require('../database/indexMongoDB');
//const db = require('../database/updateDriver');
//const db = require('../database/indexMongoDBTry2.js'); 
const db = require('../database/indexMongoTry3.js');


const app = express();

app.use(bodyParser.json());

//app.use('/', express.static(path.join(__dirname, '../client/dist')));

let populateDB = function(start, end, duration) {
	// insert batches of 50,000 records to database
	let batch = 50000;
	db.populateDrivers(start * batch, end * batch, (err, results) => {
		if (err) {
			console.log(err);
		} else {
			start++;
			// make it 200 times (recursive call to function)
			if (start === 200) {
				console.log(`Duration ${(new Date() - duration) / 1000} s`);
				return;
			} 
			populateDB(start , start + 1, duration);
		}
	})
}

app.get('/', (req, res) => {
  	db.db;
//	populateDB(0, 1, new Date());
	let driver = {
		_id: 5,
		location: {
			x: 200,
			y: 200
		},
		availability: 1,
		activity: 1
	};
	db.updateDriver(db.db, driver);
});

app.listen(3000);