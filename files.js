
const AWS = require('aws-sdk');
const { DateTime, Interval } = require('luxon');
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
  const logs = await getLogRows();
  const awsFileObjects = await this.allFiles();  

  // return items that are less than 30 days ago. these should be filtered from aws files list
  const rawLog = logs.filter( (el) => {
    // hours ago 
    const dt = DateTime.fromISO(el.date).toUTC();
    return Interval.fromDateTimes(dt, DateTime.utc()).count('days')-1 < 31;
  });

  // make arrays of the two file obj sources
  const awsFiles = awsFileObjects.map( (obj) => {
    return settings.config.aws.S3_URL + obj.Key
  });
  const logContent = rawLog.map( (obj) => {
    return obj.content
  })

  // filter the files out of aws list where they are in the logs list
  let filteredFiles = awsFiles.filter( (el) => {
    return !logContent.includes(el)
  });

  // return a random file from the filtered set
  return filteredFiles[ Math.floor(Math.random() * filteredFiles.length + 1) ]

}

