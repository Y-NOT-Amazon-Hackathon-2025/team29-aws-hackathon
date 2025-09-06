const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

// 사용자 프로필 테이블 생성
async function createUserProfileTable() {
  console.log('👤 UserProfileTable 생성 중...');
  
  try {
    await dynamodb.send(new CreateTableCommand({
      TableName: 'UserProfileTable',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'type', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'type', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    
    console.log('✅ UserProfileTable 생성 완료');
    
    // 테이블 생성 후 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️ UserProfileTable이 이미 존재합니다');
    } else {
      console.error('❌ 테이블 생성 실패:', error);
      throw error;
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  createUserProfileTable().catch(console.error);
}

module.exports = { createUserProfileTable };
