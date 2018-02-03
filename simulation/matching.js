const axios = require('axios');
const express = require('express');

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/available/cars', (req, res) => {
  console.log(`Driver ${req.body.params.driverId} has activity: ${req.body.params.activity}`);
  res.send(`Updated that driver id = ${req.body.params.driverId} is offline`);
});

//app.get('/available/cars');

app.listen(5000);
