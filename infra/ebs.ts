import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as config from "./config";

import "./s3/s3";

// Create an IAM Role for the instance profile
const instanceRole = new aws.iam.Role("ebs-instance-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "ec2.amazonaws.com",
  }),
});

// Attach policies to the instance role
const instancePolicies = [
  "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier",
  "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier",
  "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker",
  "arn:aws:iam::aws:policy/AmazonS3FullAccess",
];

instancePolicies.forEach((policyArn, index) => {
  new aws.iam.RolePolicyAttachment(`instance-role-attachment-${index}`, {
    role: instanceRole.name,
    policyArn,
  });
});

// Create an instance profile
const instanceProfile = new aws.iam.InstanceProfile("ebs-instance-profile", {
  role: instanceRole.name,
});

// Create a service role for Elastic Beanstalk
const serviceRole = new aws.iam.Role("ebs-service-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "elasticbeanstalk.amazonaws.com",
  }),
});

// Attach the managed policy for Elastic Beanstalk service role
new aws.iam.RolePolicyAttachment("service-role-attachment", {
  role: serviceRole.name,
  policyArn:
    "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth",
});

// Create the Elastic Beanstalk Application
const invoicerApp = new aws.elasticbeanstalk.Application("invoicer-newerer", {
  name: "invoicer-newerer",
  description: "Securing DevOps Invoicer App",
});

// Create the Elastic Beanstalk Application Version
const invoicerAppVersion = new aws.elasticbeanstalk.ApplicationVersion(
  "invoicer-app-version-newerer",
  {
    application: invoicerApp.name,
    description: "Invoicer App Version",
    bucket: "invoicer-bucket", // Replace with your S3 bucket name
    key: "Dockerrun.aws.json", // Replace with your S3 object key
    name: "v1.0.3",
  }
);

// Create the Elastic Beanstalk Environment
const invoicerEnv = new aws.elasticbeanstalk.Environment(
  "invoicer-api-newerer",
  {
    name: "invoicer-api-newerer",
    version: invoicerAppVersion,
    application: invoicerApp.name,
    description: "invoicer app",
    solutionStackName: "64bit Amazon Linux 2 v4.1.0 running Docker",
    settings: [
      {
        namespace: "aws:autoscaling:launchconfiguration",
        name: "IamInstanceProfile",
        value: instanceProfile.name,
      },
      {
        namespace: "aws:elasticbeanstalk:environment",
        name: "ServiceRole",
        value: serviceRole.name,
      },
      {
        namespace: "aws:elasticbeanstalk:application:environment",
        name: "INVOICER_POSTGRES_USER",
        value: config.dbUser,
      },
      {
        namespace: "aws:elasticbeanstalk:application:environment",
        name: "INVOICER_POSTGRES_PASSWORD",
        value: config.dbPassword,
      },
      {
        namespace: "aws:elasticbeanstalk:application:environment",
        name: "INVOICER_POSTGRES_DB",
        value: config.dbName,
      },
      {
        namespace: "aws:elasticbeanstalk:application:environment",
        name: "INVOICER_POSTGRES_HOST",
        value: config.dbHost,
      },
    ],
  }
);

export const endpointUrl = pulumi.interpolate`${invoicerEnv.endpointUrl}`;
export const envId = invoicerEnv.id;
