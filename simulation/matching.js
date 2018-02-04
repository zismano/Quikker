const axios = require('axios');
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/available/cars', (req, res) => {
  if (req.body.params.message === 'Match') {
    console.log('Match');
  } else if (req.body.params.message === 'No match') {
    console.log('Driver turned offline before he got matched');
  } else if (req.body.params.message === 'Driver is offline') {
    console.log(`Driver ${req.body.params.driverId} has activity: ${req.body.params.activity}`);
    res.send(`Updated that driver id = ${req.body.params.driverId} is offline`);
  }
});

app.get('/available/cars', (req, res) => {
  console.log(`Trying to find a match for ${req.query.driverId}`);
  let match = {
  	driverId: req.query.driverId, 
  	userId: Math.floor(Math.random() * 1000000) + 1,
  	srcLocation: {
  	  x: Math.floor(Math.random() * 1000),
  	  y: Math.floor(Math.random() * 1000),
  	},
  	destLocation: {
  	  x: Math.floor(Math.random() * 1000),
  	  y: Math.floor(Math.random() * 1000),
  	},
  }
  res.send(match);
});

app.listen(5000);
