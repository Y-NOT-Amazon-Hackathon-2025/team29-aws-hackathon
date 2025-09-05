#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CertificationStack } from '../lib/certification-stack';

const app = new cdk.App();
new CertificationStack(app, 'CertificationStack');
