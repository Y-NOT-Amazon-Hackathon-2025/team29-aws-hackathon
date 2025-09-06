import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export class CertSearchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for Redis
    const vpc = new ec2.Vpc(this, 'CertSearchVpc', {
      maxAzs: 2,
      natGateways: 1
    });

    // DynamoDB Table for Certifications
    const certTable = new dynamodb.Table(this, 'CertificationsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true
    });

    // GSI for search optimization
    certTable.addGlobalSecondaryIndex({
      indexName: 'CategoryIndex',
      partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'name', type: dynamodb.AttributeType.STRING }
    });

    // Redis Cluster
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for Redis',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId)
    });

    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc,
      description: 'Security group for Redis cluster'
    });

    const redisCluster = new elasticache.CfnCacheCluster(this, 'RedisCluster', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      cacheSubnetGroupName: redisSubnetGroup.ref
    });

    // Lambda Functions
    const updaterFunction = new lambda.Function(this, 'CertUpdaterFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handlers/cert-updater.handler',
      code: lambda.Code.fromAsset('../lambda'),
      timeout: cdk.Duration.minutes(15),
      environment: {
        CERT_TABLE: certTable.tableName
      }
    });

    const searchFunction = new lambda.Function(this, 'CertSearchFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handlers/cert-search.search',
      code: lambda.Code.fromAsset('../lambda'),
      vpc,
      environment: {
        CERT_TABLE: certTable.tableName,
        REDIS_URL: `redis://${redisCluster.attrRedisEndpointAddress}:${redisCluster.attrRedisEndpointPort}`
      }
    });

    // Permissions
    certTable.grantReadWriteData(updaterFunction);
    certTable.grantReadData(searchFunction);
    
    redisSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(searchFunction.connections.securityGroups[0].securityGroupId),
      ec2.Port.tcp(6379)
    );

    // EventBridge Rule for scheduled updates
    const updateRule = new events.Rule(this, 'CertUpdateRule', {
      schedule: events.Schedule.cron({ hour: '2', minute: '0' }) // Daily at 2 AM
    });
    updateRule.addTarget(new targets.LambdaFunction(updaterFunction));

    // API Gateway
    const api = new apigateway.RestApi(this, 'CertSearchApi', {
      restApiName: 'Certification Search API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const certifications = api.root.addResource('certifications');
    certifications.addMethod('GET', new apigateway.LambdaIntegration(searchFunction));
    
    const certById = certifications.addResource('{id}');
    certById.addMethod('GET', new apigateway.LambdaIntegration(
      new lambda.Function(this, 'CertGetByIdFunction', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'handlers/cert-search.getById',
        code: lambda.Code.fromAsset('../lambda'),
        vpc,
        environment: {
          CERT_TABLE: certTable.tableName,
          REDIS_URL: `redis://${redisCluster.attrRedisEndpointAddress}:${redisCluster.attrRedisEndpointPort}`
        }
      })
    ));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Certification Search API URL'
    });

    new cdk.CfnOutput(this, 'CertTableName', {
      value: certTable.tableName,
      description: 'Certifications DynamoDB Table Name'
    });

    // Custom Resource for Initial Data Collection
    const initialDataProvider = new cr.Provider(this, 'InitialDataProvider', {
      onEventHandler: new lambda.Function(this, 'InitialDataHandler', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'handlers/initial-data-trigger.handler',
        code: lambda.Code.fromAsset('../lambda'),
        timeout: cdk.Duration.minutes(2),
        environment: {
          UPDATER_FUNCTION_NAME: updaterFunction.functionName
        }
      })
    });

    // Grant permission to invoke updater function
    updaterFunction.grantInvoke(initialDataProvider.onEventHandler);

    // Custom Resource that triggers initial data collection
    new cdk.CustomResource(this, 'InitialDataCollection', {
      serviceToken: initialDataProvider.serviceToken,
      properties: {
        // Change this value to trigger re-collection
        timestamp: Date.now().toString()
      }
    });
  }
}
