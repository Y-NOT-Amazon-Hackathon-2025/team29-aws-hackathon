const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const dynamodb = new DynamoDBClient({});
const sns = new SNSClient({});

exports.handler = async (event) => {
  console.log('Notification check started');
  
  try {
    // 오늘 날짜
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 7일 후 날짜
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);
    const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];
    
    // 1일 후 날짜
    const oneDayLater = new Date(today);
    oneDayLater.setDate(today.getDate() + 1);
    const oneDayStr = oneDayLater.toISOString().split('T')[0];

    // 알림 대상 조회
    const notifications = await getNotificationTargets();
    
    for (const notification of notifications) {
      const examDate = notification.examDate?.S;
      const userEmail = notification.email?.S;
      const certName = notification.certName?.S;
      
      if (!examDate || !userEmail) continue;
      
      // 7일 전 알림
      if (examDate === sevenDaysStr) {
        await sendNotification(
          userEmail,
          `${certName} 시험 7일 전 알림`,
          `안녕하세요! ${certName} 시험이 일주일 후(${examDate})입니다. 마지막 점검을 시작하세요! 🎯`
        );
      }
      
      // 1일 전 알림
      if (examDate === oneDayStr) {
        await sendNotification(
          userEmail,
          `${certName} 시험 D-1 알림`,
          `내일이 ${certName} 시험일입니다! 충분한 휴식을 취하고 자신감을 가지세요. 화이팅! 💪`
        );
      }
    }
    
    return { statusCode: 200, body: 'Notifications processed successfully' };
  } catch (error) {
    console.error('Notification error:', error);
    return { statusCode: 500, body: 'Error processing notifications' };
  }
};

async function getNotificationTargets() {
  // 사용자별 시험 일정 조회
  const command = new ScanCommand({
    TableName: process.env.USER_TABLE,
    FilterExpression: 'begins_with(#type, :notifType) AND #status = :status',
    ExpressionAttributeNames: {
      '#type': 'type#id',
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':notifType': { S: 'notification#' },
      ':status': { S: 'pending' }
    }
  });
  
  const result = await dynamodb.send(command);
  return result.Items || [];
}

async function sendNotification(email, subject, message) {
  const command = new PublishCommand({
    TopicArn: process.env.SNS_TOPIC_ARN,
    Subject: subject,
    Message: message,
    MessageAttributes: {
      email: {
        DataType: 'String',
        StringValue: email
      }
    }
  });
  
  await sns.send(command);
  console.log(`Notification sent to ${email}: ${subject}`);
}
