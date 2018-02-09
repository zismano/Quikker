const AWS = require('aws-sdk');
const keys = require('../config.js');

AWS.config.region = 'us-west-2';  // us-west-1 (North California) doesn't work
AWS.config.update({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
});

const sns = new AWS.SNS();

let sendSMS = (name, phone) => {
  let params = {
    Message: `Hello ${name}, surge ratio is high! Connect Quikker NOW!`,
    MessageStructure: 'string',
    PhoneNumber: phone,	// '+14084105813'
 //   Subject: 'Quikker - become online!'
  };	
  sns.publish(params, function(err, data) {})
}

module.exports = {
  sendSMS,
}