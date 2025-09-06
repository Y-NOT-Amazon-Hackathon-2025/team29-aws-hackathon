#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { CertificationStack } = require('../lib/certification-stack');

const app = new cdk.App();
new CertificationStack(app, 'CertificationStack');
