import * as aws from "@pulumi/aws";
import * as config from "./config";

// Create a new security group with a specific name
const rdsSecurityGroup = new aws.ec2.SecurityGroup("rdsSecurityGroup", {
  description: "Allow traffic to RDS instance",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 5432,
      toPort: 5432,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  name: "RDS-security-group",
});

//create rds instance
const dbInstance = new aws.rds.Instance("invoicerdb", {
  allocatedStorage: 5,
  engine: "postgres",
  engineVersion: "17.4",
  instanceClass: "db.t3.micro",
  dbName: "invoicer",
  username: config.dbUser,
  password: config.dbPassword,
  vpcSecurityGroupIds: ["sg-0459447d78512eb82"],
  publiclyAccessible: true,
  multiAz: false,
  skipFinalSnapshot: true,
  identifier: config.dbName,
});

// export the Security Group ID
export const securityGroupId = rdsSecurityGroup.id;
export const dbInstanceEndpoint = dbInstance.endpoint;
