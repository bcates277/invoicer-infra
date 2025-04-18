import * as aws from "@pulumi/aws";
import * as fs from "fs";

// Create an S3 bucket
const bucket = new aws.s3.Bucket("invoicer-bucket", {
  bucket: "invoicer-bucket",
  acl: "private", // Set the bucket to private
  versioning: {
    enabled: true, // Enable versioning for the bucket
  },
});

// Upload the docker.json file to the S3 bucket
const dockerFile = new aws.s3.BucketObject("dockerrun", {
  bucket: bucket.bucket, // Reference the bucket
  key: "Dockerrun.aws.json", // The key (file name) in the bucket
  content: fs.readFileSync("./s3/Dockerrun.aws.json", "utf-8"),
  contentType: "application/json", // Set the content type
});

// Export the bucket name
export const bucketName = bucket.bucket;
