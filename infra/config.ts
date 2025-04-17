import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Load the Pulumi config for the current stack
const config = new pulumi.Config();

// Get the password stored as a secret under the key "dbPassword"
export const dbPassword = config.requireSecret("dbPassword");
export const dbUser = config.require("dbUser");
export const dbName = config.require("dbName");
export const dbHost = config.require("dbHost");