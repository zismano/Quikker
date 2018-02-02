const express = require('express');
const bodyParser = require('body-parser');
//const path = require('path'); 
//const db = require('../database/indexMongo.js');
const dbCass = require('../database/indexCassandra.js');

const app = express();

app.use(bodyParser.json());

//app.use('/', express.static(path.join(__dirname, '../client/dist')));

app.get('/', (req, res) => {
 // 	db.db;

//	db.populateDB(0, 1, new Date());

	// let driver = {
	// 	driverId: 5,
	// 	location: {
	// 		x: 100,
	// 		y: 200
	// 	},
	// 	availability: 1,
	// 	activity: 1
	// };
	// db.updateDriver(db.db, driver);

//	db.updateManyDrivers(0, new Date());
	console.log('started');
	dbCass.insertBatch(0, new Date());
});

app.listen(3000);