require('dotenv').config();

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Set the region 
AWS.config.update({region: process.env.AWS_REGION});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var params = {
  AttributeDefinitions: [
    {
      AttributeName: 'CUSTOMER_ID',
      AttributeType: 'N'
    },
    {
      AttributeName: 'CUSTOMER_NAME',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'CUSTOMER_ID',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'CUSTOMER_NAME',
      KeyType: 'RANGE'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: 'CUSTOMER_LIST',
  StreamSpecification: {
    StreamEnabled: false
  }
};

(async () => {
  // Call DynamoDB to create the table
  await ddb.createTable(params, function(err, data) {
    if (err) {
      if (err.code === 'ResourceInUseException') {
      console.log('Table exists')
      } else {throw console.log('some other error')}
      
    } else {
      console.log("Table Created", data);
    }
  });

  await ddb.listTables({Limit: 10}, function(err, data) {
    if (err) {
      console.log("Error", err.code);
    } else {
      console.log("Table names are ", data.TableNames);
    }
  });

  await ddb.describeTable({TableName: 'CUSTOMER_LIST'}, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Table.KeySchema);
    }
  });

  ddb.deleteTable({TableName: 'CUSTOMER_LIST'}, function(err, data) {
    if (err && err.code === 'ResourceNotFoundException') {
      console.log("Error: Table not found");
    } else if (err && err.code === 'ResourceInUseException') {
      console.log("Error: Table in use");
    } else {
      console.log("Success", data);
    }
  });
})();
