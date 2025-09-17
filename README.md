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


