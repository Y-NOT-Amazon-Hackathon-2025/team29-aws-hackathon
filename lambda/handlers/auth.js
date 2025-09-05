const { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognito = new CognitoIdentityProviderClient({});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Access-Control-Allow-Origin': '*' },
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
    
    // Get user details
    let userName = 'User';
    try {
      const userCommand = new AdminGetUserCommand({
        UserPoolId: process.env.USER_POOL_ID,
        Username: email
      });
      const userResult = await cognito.send(userCommand);
      const nameAttr = userResult.UserAttributes?.find(attr => attr.Name === 'name');
      if (nameAttr) {
        userName = nameAttr.Value;
      }
    } catch (error) {
      console.log('Could not get user details:', error);
    }
    
    return response(200, {
      accessToken: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      idToken: result.AuthenticationResult.IdToken,
      user: {
        userId: result.AuthenticationResult.AccessToken, // Will be parsed by JWT
        email: email,
        name: userName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return response(401, { error: 'Invalid credentials' });
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
