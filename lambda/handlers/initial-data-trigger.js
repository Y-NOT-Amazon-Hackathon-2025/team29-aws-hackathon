const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambda = new LambdaClient({});

exports.handler = async (event) => {
  console.log('Custom Resource Event:', JSON.stringify(event, null, 2));
  
  const { RequestType, ResourceProperties } = event;
  
  try {
    // Only trigger on Create and Update events
    if (RequestType === 'Create' || RequestType === 'Update') {
      console.log('Triggering initial data collection...');
      
      const command = new InvokeCommand({
        FunctionName: process.env.UPDATER_FUNCTION_NAME,
        InvocationType: 'Event', // Async invocation
        Payload: JSON.stringify({
          source: 'initial-deployment',
          timestamp: new Date().toISOString()
        })
      });
      
      await lambda.send(command);
      console.log('Initial data collection triggered successfully');
    }
    
    // Return success response for CloudFormation
    return {
      Status: 'SUCCESS',
      PhysicalResourceId: `initial-data-${ResourceProperties.timestamp}`,
      Data: {
        Message: 'Initial data collection triggered'
      }
    };
  } catch (error) {
    console.error('Error triggering initial data collection:', error);
    
    // Return failure response for CloudFormation
    return {
      Status: 'FAILED',
      PhysicalResourceId: `initial-data-${ResourceProperties.timestamp}`,
      Reason: error.message
    };
  }
};
