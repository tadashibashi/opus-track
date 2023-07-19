// Load AWS SDK
import AWS from "aws-sdk";

// Config
AWS.config.update({region: "us-west-1"});

// Create S3 service object
export const s3 = new AWS.S3({apiVersion: "latest"});

// Get a list of buckets available in AWS S3
async function listBuckets(): Promise<AWS.S3.Bucket[] | undefined> {
    return new Promise((resolve, reject) => {
        s3.listBuckets((err, data) => {
            if (err) {
                reject(err);
            }  else {
                resolve(data.Buckets);
            }
        });
    });
}

async function listObjects(bucketName: string): Promise<AWS.S3.ListObjectsOutput> {
    return new Promise( (resolve, reject) => {
        s3.listObjects({ Bucket: bucketName}, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}
