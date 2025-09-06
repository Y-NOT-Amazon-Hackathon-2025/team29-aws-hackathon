# Security Guidelines

## 🚨 CRITICAL: Never commit AWS credentials

- AWS access keys should NEVER be committed to version control
- Use environment variables or AWS IAM roles instead
- If credentials are accidentally committed, rotate them immediately

## Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your actual values
3. Never commit `.env.local` to git

## AWS Best Practices

- Use IAM roles with minimal required permissions
- Enable MFA on AWS accounts
- Regularly rotate access keys
- Use AWS Secrets Manager for sensitive data
- Enable CloudTrail for audit logging

## Deployment Security

- Use HTTPS only in production
- Implement proper CORS policies
- Validate all user inputs
- Use AWS Cognito for authentication
- Enable AWS Guardrails for AI safety
