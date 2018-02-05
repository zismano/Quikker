const AWS = require('aws-sdk');
const keys = require('../config.js');

AWS.config.region = 'us-west-2';  // us-west-1 (North California) doesn't work
AWS.config.update({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
});

const sns = new AWS.SNS();
let params = {
    Message: "Hello from Quikker! FWY - surge ratio is high, become online",
    MessageStructure: 'string',
    PhoneNumber: '+14084105813',
 //   Subject: 'Quikker - become online!'
};

sns.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});