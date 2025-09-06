const cdk = require('aws-cdk-lib');
const events = require('aws-cdk-lib/aws-events');
const targets = require('aws-cdk-lib/aws-events-targets');
const sns = require('aws-cdk-lib/aws-sns');
const snsSubscriptions = require('aws-cdk-lib/aws-sns-subscriptions');
const lambda = require('aws-cdk-lib/aws-lambda');
const iam = require('aws-cdk-lib/aws-iam');

class NotificationStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // SNS Topic for notifications
    const notificationTopic = new sns.Topic(this, 'NotificationTopic', {
      displayName: 'Certification Exam Notifications'
    });

    // Lambda function for processing notifications
    const notificationLambda = new lambda.Function(this, 'NotificationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'notification.handler',
      code: lambda.Code.fromAsset('../lambda'),
      environment: {
        SNS_TOPIC_ARN: notificationTopic.topicArn,
        USER_TABLE: props.userTableName
      }
    });

    // Grant permissions
    notificationTopic.grantPublish(notificationLambda);
    
    // EventBridge rule for daily notification check
    const dailyRule = new events.Rule(this, 'DailyNotificationRule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '9',  // 매일 오전 9시
        day: '*',
        month: '*',
        year: '*'
      })
    });

    dailyRule.addTarget(new targets.LambdaFunction(notificationLambda));

    // Grant EventBridge permissions to Lambda
    notificationLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['dynamodb:Scan', 'dynamodb:Query'],
      resources: [props.userTableArn]
    }));

    // Outputs
    new cdk.CfnOutput(this, 'NotificationTopicArn', {
      value: notificationTopic.topicArn
    });
  }
}

module.exports = { NotificationStack };
