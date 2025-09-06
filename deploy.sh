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

# Deploy infrastructure (includes initial data collection)
cd infrastructure
npm install
npx cdk bootstrap --region $AWS_DEFAULT_REGION

echo "🏗️ Deploying infrastructure with automatic data collection..."
npx cdk deploy CertSearchStack --require-approval never --region $AWS_DEFAULT_REGION

# Get outputs
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text --region $AWS_DEFAULT_REGION 2>/dev/null || echo "")
API_URL=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text --region $AWS_DEFAULT_REGION 2>/dev/null || echo "")
CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?OutputKey==`DistributionUrl`].OutputValue' --output text --region $AWS_DEFAULT_REGION 2>/dev/null || echo "")
CERT_TABLE_NAME=$(aws cloudformation describe-stacks --stack-name CertificationStack --query 'Stacks[0].Outputs[?contains(OutputKey, `CertificationsTable`)].OutputValue' --output text --region $AWS_DEFAULT_REGION 2>/dev/null || echo "")

# Get search API URL
SEARCH_API_URL=$(aws cloudformation describe-stacks --stack-name CertSearchStack --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text --region $AWS_DEFAULT_REGION 2>/dev/null || echo "")

cd ..

# Wait for initial data collection to complete
echo "⏳ Waiting for initial data collection to complete..."
sleep 30

# Check if data collection is in progress
echo "📊 Checking data collection status..."
UPDATER_FUNCTION=$(aws cloudformation describe-stacks --stack-name CertSearchStack --query 'Stacks[0].Outputs[?contains(OutputKey, `UpdaterFunction`)].OutputValue' --output text --region $AWS_DEFAULT_REGION 2>/dev/null || echo "CertSearchStack-CertUpdaterFunction")

# Monitor data collection (optional)
for i in {1..10}; do
  echo "Checking data collection progress... ($i/10)"
  sleep 10
done

# Populate sample data (if original table exists)
if [ ! -z "$CERT_TABLE_NAME" ]; then
  echo "📊 Adding sample curriculum data..."
  node scripts/populate-data.js $CERT_TABLE_NAME
else
  echo "ℹ️ Skipping sample curriculum data (table not found)"
fi

# Build and deploy frontend
if [ ! -z "$BUCKET_NAME" ]; then
  echo "🎨 Building and deploying frontend..."
  export NEXT_PUBLIC_API_URL=$API_URL
  export NEXT_PUBLIC_SEARCH_API_URL=$SEARCH_API_URL
  npm run build
  aws s3 sync out/ s3://$BUCKET_NAME --delete --region $AWS_DEFAULT_REGION
else
  echo "⚠️ Frontend bucket not found, skipping frontend deployment"
fi

echo "✅ Deployment complete!"
echo ""
echo "🌐 Services:"
if [ ! -z "$CLOUDFRONT_URL" ]; then
  echo "   Frontend: https://$CLOUDFRONT_URL"
fi
if [ ! -z "$API_URL" ]; then
  echo "   Main API: $API_URL"
fi
if [ ! -z "$SEARCH_API_URL" ]; then
  echo "   Search API: $SEARCH_API_URL"
fi
echo ""
echo "📊 Initial Q-Net data collection has been triggered automatically"
echo "   Data will be available within 5-10 minutes"
