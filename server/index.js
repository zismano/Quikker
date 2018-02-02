const express = require('express');
const bodyParser = require('body-parser');
//const path = require('path'); 
const db = require('../database/indexMongo.js');
//const dbCass = require('../database/indexCassandra.js');

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
//	console.log('started');
//	dbCass.insertBatch(0, new Date());
 //dbCass.countDriversByQuery("activity"); 
// dbCass.findDriversByQuery("activity");
//	db.countByActivity();

});
//db.db;
//	 db.countByActivity();

app.get('/cars', (req, res) => {
//	console.log(req);
	res.send('Success');
//	 db.countByActivity();
//ex.start();


});

const d = {
  driverId: 5,
  name: 'else',
  phone: '4321',
  location: {
    x:3,
    y:5
  },
  activity: 1,
  availability: 1
};
//db.updateDriver(d);


app.listen(3000);