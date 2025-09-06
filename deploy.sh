#!/bin/bash

echo "🚀 Deploying Certification Platform..."

# Set default region if not configured
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}

# Install root dependencies (for scripts)
echo "📦 Installing root dependencies..."
npm install

# Install Lambda dependencies
echo "📦 Installing Lambda dependencies..."
cd lambda && npm install && cd ..

# Deploy infrastructure
cd infrastructure
npm install
npx cdk bootstrap --region $AWS_DEFAULT_REGION
npx cdk deploy --require-approval never --region $AWS_DEFAULT_REGION

# Get outputs
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text --region $AWS_DEFAULT_REGION)
API_URL=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text --region $AWS_DEFAULT_REGION)
CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?OutputKey==`DistributionUrl`].OutputValue' --output text --region $AWS_DEFAULT_REGION)
CERT_TABLE_NAME=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?contains(OutputKey, `CertificationsTable`)].OutputValue' --output text --region $AWS_DEFAULT_REGION)

cd ..

# Populate sample data
echo "📊 Adding sample data..."
if [ ! -z "$CERT_TABLE_NAME" ]; then
  node scripts/populate-data.js $CERT_TABLE_NAME
else
  echo "⚠️  Could not find certifications table name, skipping sample data"
fi

# Build and deploy frontend
echo "🎨 Building frontend..."
export NEXT_PUBLIC_API_URL=$API_URL
npm run build
aws s3 sync out/ s3://$BUCKET_NAME --delete --region $AWS_DEFAULT_REGION

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://$CLOUDFRONT_URL"
echo "🔗 API: $API_URL"
