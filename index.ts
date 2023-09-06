import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Define a new security group
let webSg = new aws.ec2.SecurityGroup("webSg", {
    description: "Enable ports for http and ssh",
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] }, // SSH access
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] }  // HTTP access
    ]
});

// free-tier type
const freeTierType = "t2.micro";

// Query for the most recent Ubuntu 20.04 LTS AMI
let ami = pulumi.output(aws.ec2.getAmi({
    filters: [{
        name: "name",
        values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
    }],
    owners: ["099720109477"], // Canonical
    mostRecent: true,
}));

// Create an EC2 instance using the security group and AMI previously defined
let webServer = new aws.ec2.Instance("web-server", {
    instanceType: freeTierType,
    vpcSecurityGroupIds: [ webSg.id ], // reference to the above-defined security group 
    ami: ami.id,
});

// Export the necessary information about the instance.
export const instanceId = webServer.id;
export const publicIp = webServer.publicIp;
export const publicHostName = webServer.publicDns;
