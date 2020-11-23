
const AWS = require('aws-sdk');
const settings = require('./settings.json');
const { getLogRows } = require('./db');

const s3Params = {
  Bucket: settings.config.aws.AWS_BUCKET,
};


exports.allFiles = async () => {
  return new Promise( async (resolve, reject) => {
    let s3 = new AWS.S3();

    s3.listObjects(s3Params, async (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Contents);
      }
    });
  })
};

exports.randomFile = async () => {
  // send a randomly selected file
  let awsFiles = await this.allFiles();
  let logFiles = await this.getLogFiles();

  let pickFile = function(awsFiles, logFiles) {
    function randomFile(awsFiles) {
      return settings.config.aws.S3_URL + awsFiles[ Math.floor(Math.random() * awsFiles.length + 1) ].Key
    } 

    function checkExists(logFiles, awsFiles) {
      const filterRes = logFiles.filter( (el) => {
        return awsFiles.includes(el.content)
      });
    
      console.log(res.length > 0);
    }

  }
}

