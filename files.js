
const AWS = require('aws-sdk');
const settings = require('./settings.json');

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
  let files = await this.allFiles();
  return settings.config.aws.S3_URL + files[ Math.floor(Math.random() * files.length + 1) ].Key;
}

