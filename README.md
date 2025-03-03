# Resume AI

An AI-powered resume analysis and improvement tool that helps job seekers optimize their resumes for specific job positions.

## Features

- Resume upload and analysis
- AI-powered feedback and suggestions
- Resume comparison
- User authentication and profile management
- Resume storage and history

## Static Website Limitations

The deployed version at [https://resumethecv.web.app](https://resumethecv.web.app) is a static website with limited functionality. The following features require server-side processing and are not available in the static deployment:

- Resume text extraction
- AI-powered resume analysis
- Resume comparison

## Running Locally for Full Functionality

To access all features, you need to run the application locally:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/resume-ai.git
   cd resume-ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the following environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is deployed as a static website to Firebase Hosting. To deploy your own version:

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase:
   ```
   firebase init
   ```

4. Build and deploy:
   ```
   npm run deploy
   ```

## API Endpoints

When running locally, the following API endpoints are available:

- `/api/extract-text` - Extracts text from uploaded resume files
- `/api/analyze-resume` - Analyzes resume text and provides feedback
- `/api/analyze-resume-fallback` - Fallback endpoint for resume analysis

## Technologies Used

- Next.js
- React
- TypeScript
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- DeepSeek API for AI analysis

## License

[MIT](LICENSE)
