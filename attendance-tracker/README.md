<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# Attendance Tracker PWA

A full-stack Progressive Web App for tracking student attendance using QR codes and face recognition.

## Features

- **Firebase Authentication** - Google Sign-in with SKCET email validation
- **QR Code Scanning** - Students scan QR codes to mark attendance
- **Face Recognition** - Selfie verification using Azure Face API
- **Admin Dashboard** - Generate QR codes and view attendance records
- **Student Dashboard** - View personal attendance history
- **PWA Support** - Installable on mobile devices
- **Real-time Updates** - Auto-refreshing QR codes and attendance data

## Tech Stack

### Frontend
- React 18 with Vite
- Material UI for components
- Firebase Authentication
- React Router for navigation
- PWA capabilities

### Backend
- Spring Boot 3 (Java 17)
- Firebase Admin SDK
- Azure Face API integration
- Firestore database
- Spring Security with JWT

## Setup Instructions

### Prerequisites
- Node.js 16+
- Java 17+
- Maven 3.6+
- Firebase project with Authentication and Firestore enabled
- Azure Face API subscription (optional for demo)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd attendance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:4000
```

5. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd springapp
```

2. Create Firebase service account:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate new private key
   - Save as `serviceAccount.json` in the springapp directory

3. Update `application.properties` with your configuration:
```properties
server.port=4000
firebase.service.account=./serviceAccount.json
cors.allowed.origin=http://localhost:5173
qr.ttl.ms=5000
azure.face.endpoint=your_azure_face_endpoint
azure.face.key=your_azure_face_key
```

4. Run the application:
```bash
mvn spring-boot:run
```

## Usage

### For Admins
1. Sign in with an email containing "admin" and ending with @skcet.ac.in
2. Access the admin dashboard at `/admin`
3. Display the auto-refreshing QR code for students to scan
4. View attendance records and export to CSV

### For Students
1. Sign in with your @skcet.ac.in email
2. Navigate to the scanner at `/scan`
3. Scan the QR code displayed by your teacher
4. Take a selfie for face verification
5. View your attendance history at `/student`

## API Endpoints

### QR Management
- `GET /api/generate-qr` - Generate QR token (Admin only)
- `POST /api/validate-qr` - Validate QR token

### Face Recognition
- `POST /api/verify-face` - Verify face and mark attendance

### Attendance
- `GET /api/list-attendance` - Get all attendance records (Admin only)
- `GET /api/student-attendance` - Get student's attendance records

## Security

- Firebase Authentication with email domain validation
- JWT token verification for API endpoints
- Role-based access control (Admin/Student)
- CORS configuration for frontend-backend communication

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update environment variables in deployment platform

### Backend (Heroku/Railway)
1. Create `Procfile`: `web: java -jar target/attendance-0.0.1-SNAPSHOT.jar`
2. Set environment variables in deployment platform
3. Deploy using Maven buildpack

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.


>>>>>>> fc1e72c4ccac1f88e76af174ed36e22ab4eb4fe7
