import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
      region: process.env.AWS_REGION || 'ap-northeast-2',
    }
  }
};

export const configureAmplify = () => {
  Amplify.configure(awsConfig);
};

export default awsConfig;
