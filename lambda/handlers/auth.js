const { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognito = new CognitoIdentityProviderClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  },
  body: JSON.stringify(body)
});

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

exports.register = async (data) => {
  const { email, password, name } = data;
  
  try {
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
    
    return response(201, {
      userId: result.UserSub,
      message: 'User created successfully. Please check your email for verification.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return response(400, { error: error.message });
  }
};
