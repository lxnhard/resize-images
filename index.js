
const AWS = require("aws-sdk");
const sharp = require("sharp");

const S3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  // Read data from event object.
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const destKey = "resized-images/" + sourceKey.split('/').slice(-1)[0];

  // Retrieve original image
  const originalImage = await S3.getObject({ Bucket: sourceBucket, Key: sourceKey }).promise();

  // resize image
  const resizedImage = await sharp(originalImage.Body)
    .resize(200)
    .jpeg({ mozjpeg: true })
    .toBuffer();

  // upload image
  const uploadImage = await S3.putObject({
    Body: resizedImage,
    Bucket: sourceBucket,
    ContentType: 'image',
    Key: destKey
  }).promise();

  return uploadImage;
};