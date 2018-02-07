// Simulating server of Pricing
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// just for simulation - data inside req.body.params
app.post('/pricing', (req, res) => {
  console.log(req.body.params);
  res.send('Status received');
})

let sendSurgeRatio = surgeRatio => {
	axios.post('http://127.0.0.1:3000/pricing', { 
	  data: {
	    surgeRatio,
	  },
	})
	.then(results => {
		console.log(results.data);
	})
	.catch(err => {
		throw err;
	})
}

app.listen(4000);

//sendSurgeRatio(3.5);

