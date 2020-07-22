require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESSKEYID,
  secretAccessKey: process.env.AWS_SECRETACCESSKEY
});

const s3Params = {
  Bucket: process.env.AWS_BUCKET,
};

function s3Test() {
  return new Promise( async (resolve, reject) => {
    let s3 = new AWS.S3();

    let response = await s3.listObjects(s3Params, async (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.Contents);
      }
    })      
  })    
}

(async () => {
  const res = await s3Test();
  for (d of res) {
    console.log(d)
  }  
})();  