# Deployment Instructions for Resume AI

This document outlines how to deploy your Resume AI application using Vercel for hosting and Firebase for storage.

## Deploying with Vercel

### Step 1: Push your code to GitHub
Make sure your code is in a GitHub repository.

### Step 2: Connect to Vercel
1. Go to [Vercel](https://vercel.com) and sign up or login
2. Click "New Project"
3. Import your GitHub repository
4. Configure your project:
   - Framework Preset: Next.js
   - Environment Variables: Add all the environment variables from your `.env.local` file, including:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
     DEEPSEEK_API_KEY=your_deepseek_api_key
     ```
   - Root Directory: ./

### Step 3: Deploy
Click "Deploy" and Vercel will build and deploy your application.

### Step 4: Set up your custom domain (optional)
You can set up a custom domain in the Vercel dashboard.

### Your project URL
Once deployed, your project will be available at a URL like:
```
https://resume-ai-yourusername.vercel.app
```

## Setting up Firebase Storage

You're already using Firebase for storage in your application. Make sure your Firebase project has the Storage service enabled.

### Step 1: Deploy Firebase Storage Rules
Run the following command to deploy your storage rules:
```bash
npm run firebase:deploy
```

This will apply the rules defined in `storage.rules` to your Firebase Storage.

### Step 2: Test Storage Functionality
After deployment, test that file uploads are working properly by:
1. Logging into your app at the Vercel URL
2. Uploading a resume
3. Checking your Firebase Storage console to confirm the file was saved

## Environment Variables

Make sure to set up these environment variables in your Vercel project:

1. Firebase Configuration:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

2. DeepSeek API Key:
   - `DEEPSEEK_API_KEY`

## Troubleshooting

If you encounter issues with deployment:

1. Make sure all environment variables are correctly set up in Vercel
2. Check that your Firebase project has the Storage service enabled
3. Ensure your Firebase billing plan supports the features you're using
4. Review the Vercel logs for specific error messages

## Maintaining Your Deployment

Remember to redeploy your application whenever you make changes to the codebase.

With Vercel, this can be automated by setting up continuous deployment from your GitHub repository.

If you update your Firebase Storage rules, remember to run `npm run firebase:deploy` to apply the changes.
