# VibeCut Lambda Render Setup

This guide walks through setting up Remotion Lambda for serverless video rendering.

## Prerequisites

1. AWS Account
2. AWS CLI installed and configured
3. Node.js 18+

## Step 1: AWS Credentials

Create an IAM user with the following permissions:
- AmazonS3FullAccess
- AWSLambda_FullAccess
- IAMFullAccess (for initial setup only)

Set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-east-1
```

## Step 2: Deploy Remotion Lambda Function

```bash
# Install Remotion CLI globally (if not already)
npm install -g @remotion/cli

# Deploy Lambda function
npx remotion lambda functions deploy --memory=2048 --timeout=240
```

Note the function name output (e.g., `remotion-render-2024-01-28-mem2048mb-disk2048mb-240sec`)

## Step 3: Create S3 Bucket

```bash
# Create bucket for render outputs
aws s3 mb s3://vibecut-renders --region us-east-1

# Set CORS policy
aws s3api put-bucket-cors --bucket vibecut-renders --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'
```

## Step 4: Deploy Remotion Bundle

```bash
# Build and deploy the Remotion bundle
npx remotion lambda sites create src/remotion/Root.tsx --site-name vibecut
```

Note the serve URL output.

## Step 5: Environment Variables

Add these to your `.env.local` or Vercel environment:

```bash
# AWS Config
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Remotion Lambda Config
REMOTION_LAMBDA_FUNCTION=remotion-render-2024-01-28-mem2048mb-disk2048mb-240sec
REMOTION_S3_BUCKET=vibecut-renders
REMOTION_SERVE_URL=https://remotionlambda-xxxxx.s3.us-east-1.amazonaws.com/sites/vibecut/index.html
```

## Step 6: Test Render

```bash
# Test a render locally
npm run remotion:render

# Or via the app
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "projectId": "your-project-id", "aspectRatios": ["16:9"]}'
```

## Cost Estimates

| Duration | Quality | Est. Cost |
|----------|---------|-----------|
| 5 min | Standard | ~$0.60 |
| 10 min | Standard | ~$1.20 |
| 20 min | Standard | ~$2.50 |
| 30 min | High | ~$4.50 |

Lambda pricing: ~$0.0000166667/GB-second
S3 pricing: ~$0.023/GB storage, free egress

## Alternative: Local Rendering (Development)

For development without AWS, renders are simulated. The render engine checks for AWS credentials and falls back to simulation if not found.

To render locally (requires ffmpeg):
```bash
npm run remotion:render
```

## Troubleshooting

### "Function not found"
- Ensure REMOTION_LAMBDA_FUNCTION matches the deployed function name
- Check AWS_REGION matches the deployment region

### "Access Denied"
- Verify IAM permissions
- Check bucket policy allows Lambda function access

### Render timeout
- Increase Lambda timeout (max 15 minutes)
- Split long videos into segments
- Use draft quality for testing

## Useful Commands

```bash
# List deployed functions
npx remotion lambda functions ls

# List deployed sites
npx remotion lambda sites ls

# Check render progress
npx remotion lambda render status <render-id>

# Delete old renders
npx remotion lambda still delete <render-id>
```
