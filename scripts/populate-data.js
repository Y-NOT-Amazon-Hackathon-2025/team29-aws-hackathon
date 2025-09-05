const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({});

const certifications = [
  { id: 'aws-saa', name: 'AWS Solutions Architect Associate', category: 'Cloud', difficulty: 'Intermediate' },
  { id: 'cissp', name: 'CISSP', category: 'Security', difficulty: 'Advanced' },
  { id: 'pmp', name: 'Project Management Professional', category: 'Management', difficulty: 'Intermediate' },
  { id: 'cka', name: 'Certified Kubernetes Administrator', category: 'DevOps', difficulty: 'Advanced' }
];

async function populateData() {
  const tableName = process.argv[2];
  if (!tableName) {
    console.log('Usage: node populate-data.js <table-name>');
    return;
  }

  for (const cert of certifications) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: cert.id },
        name: { S: cert.name },
        category: { S: cert.category },
        difficulty: { S: cert.difficulty }
      }
    });

    try {
      await client.send(command);
      console.log(`Added: ${cert.name}`);
    } catch (error) {
      console.error(`Error adding ${cert.name}:`, error);
    }
  }
}

populateData();
