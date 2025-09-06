const { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const cognito = new CognitoIdentityProviderClient({});
const dynamodb = new DynamoDBClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  },
  body: JSON.stringify(body)
});

exports.register = async (data) => {
  const { username, password, name, birthDate, gender, majorJob, interests, email } = data;
  
  try {
    // Cognito 회원가입 (이메일을 username으로 사용)
    const command = new SignUpCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name }
      ]
    });
    
    const result = await cognito.send(command);
    const userId = result.UserSub;
    
    // DynamoDB에 사용자 프로필 저장
    await dynamodb.send(new PutItemCommand({
      TableName: 'UserProfileTable',
      Item: {
        userId: { S: userId },
        type: { S: 'profile' },
        username: { S: username },
        email: { S: email },
        name: { S: name },
        birthDate: { S: birthDate },
        gender: { S: gender },
        majorJob: { S: majorJob },
        interests: { L: interests.map(interest => ({ S: interest })) },
        createdAt: { S: new Date().toISOString() },
        updatedAt: { S: new Date().toISOString() }
      }
    }));
    
    console.log('User registered successfully:', email);
    return response(200, { 
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      userId: userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'UsernameExistsException') {
      return response(400, { error: '이미 존재하는 이메일입니다.' });
    }
    return response(400, { error: '회원가입에 실패했습니다.' });
  }
};

exports.login = async (data) => {
  const { email, password } = data;
  
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    });
    
    const result = await cognito.send(command);
    console.log('Login successful for:', email);
    
    return response(200, {
      accessToken: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      idToken: result.AuthenticationResult.IdToken,
      user: {
        email: email,
        name: 'User'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'UserNotFoundException') {
      return response(401, { error: '사용자를 찾을 수 없습니다.' });
    } else if (error.name === 'NotAuthorizedException') {
      return response(401, { error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    } else if (error.name === 'UserNotConfirmedException') {
      return response(401, { error: '이메일 인증이 필요합니다.' });
    }
    return response(401, { error: '로그인에 실패했습니다.' });
  }
};

exports.refresh = async (data) => {
  const { refreshToken } = data;
  
  try {
    const { InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
    
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    });
    
    const result = await cognito.send(command);
    console.log('Token refresh successful');
    
    return response(200, {
      accessToken: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken || refreshToken,
      idToken: result.AuthenticationResult.IdToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.name === 'NotAuthorizedException') {
      return response(401, { error: 'Refresh token이 유효하지 않습니다.' });
    }
    return response(401, { error: 'Token refresh에 실패했습니다.' });
  }
};

// 비밀번호 확인
exports.verifyPassword = async (data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  const { password } = data;
  
  try {
    // 사용자 정보 조회
    const userResult = await dynamodb.send(new GetItemCommand({
      TableName: 'UserProfileTable',
      Key: {
        userId: { S: userId },
        type: { S: 'profile' }
      }
    }));

    if (!userResult.Item) {
      return response(404, { error: '사용자를 찾을 수 없습니다.' });
    }

    const email = userResult.Item.email?.S;
    
    // Cognito로 비밀번호 확인
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    });
    
    await cognito.send(command);
    return response(200, { valid: true });
  } catch (error) {
    console.error('Password verification error:', error);
    return response(401, { error: '비밀번호가 올바르지 않습니다.' });
  }
};

// 프로필 업데이트
exports.updateProfile = async (data, userId) => {
  if (!userId) return response(401, { error: 'Unauthorized' });
  
  try {
    const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
    
    await dynamodb.send(new PutItemCommand({
      TableName: 'UserProfileTable',
      Item: {
        userId: { S: userId },
        type: { S: 'profile' },
        name: { S: data.name },
        email: { S: data.email },
        birthDate: { S: data.birthDate },
        gender: { S: data.gender },
        major: { S: data.major },
        interests: { S: data.interests },
        updatedAt: { S: new Date().toISOString() }
      }
    }));
    
    return response(200, { success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return response(500, { error: '프로필 업데이트에 실패했습니다.' });
  }
};

// 사용자 프로필 조회
exports.getUserProfile = async (userId) => {
  try {
    const result = await dynamodb.send(new GetItemCommand({
      TableName: 'UserProfileTable',
      Key: {
        userId: { S: userId },
        type: { S: 'profile' }
      }
    }));

    if (!result.Item) {
      return response(404, { error: '사용자 프로필을 찾을 수 없습니다.' });
    }

    const profile = {
      userId: result.Item.userId?.S,
      username: result.Item.username?.S,
      email: result.Item.email?.S,
      name: result.Item.name?.S,
      birthDate: result.Item.birthDate?.S,
      gender: result.Item.gender?.S,
      majorJob: result.Item.majorJob?.S,
      interests: result.Item.interests?.L?.map(item => item.S) || [],
      createdAt: result.Item.createdAt?.S,
      updatedAt: result.Item.updatedAt?.S
    };

    return response(200, { profile });
  } catch (error) {
    console.error('Get user profile error:', error);
    return response(500, { error: '프로필 조회에 실패했습니다.' });
  }
};
