📝 Personal Notes Manager
A modern, full-stack notes application where users can securely log in with Google, create, view, and delete their personal notes. All note features are protected—only authenticated users can manage their own notes.
---
🚀 Project Overview
- **Frontend:** React + Tailwind CSS
  Responsive, modular UI with seamless authentication and CRUD operations for notes.

- **Backend:** Node.js + Express + MongoDB
  RESTful API with secure authentication, user data isolation, and robust security middleware.

- **Authentication:** Google OAuth 2.0
  Secure login flow using Passport.js, JWT tokens, and session management.
---
✨ Features
- Google OAuth 2.0 authentication
- Secure JWT-based sessions
- Create, view, edit, and delete notes (CRUD)
- Notes are color-coded for organization
- Responsive, mobile-friendly UI
- User data isolation (users only see their own notes)
- Rate limiting, CORS, and secure headers for backend security
---
📁 Project Structure
personal_notes_manager/
├── client/       # React frontend
└── server/       # Express backend
---
🛠️ Setup Instructions
1. Clone the Repository
```sh
git clone https://github.com/yourusername/personal_notes_manager.git
cd personal_notes_manager
```
2. Install Dependencies
Install separately for frontend and backend:

```sh
cd client
npm install

cd ../server
npm install
```
3. Configure Environment Variables
Backend (server/.env):
Create a .env file inside the server folder with the following content:

MONGODB_URI=mongodb://localhost:27017/notes-app
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5007/auth/google/callback

Replace your_session_secret with a strong random string.
Replace Google OAuth values as described below.
🔐 Google OAuth Setup
Go to Google Cloud Console.
Create a new OAuth 2.0 Client ID:
- Application type: Web application
- Name: e.g., Personal Notes App
- Authorized redirect URIs:
  Add: http://localhost:5007/auth/google/callback

Copy the generated Client ID and Client Secret into your .env file.
Example:

GOOGLE_CLIENT_ID=1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5007/auth/google/callback
4. Start the Application
Start Backend:
```sh
cd server
npm start
# or
node app.js
```

Start Frontend:
```sh
cd ../client
npm start
# or, if using Vite
npm run dev
```
5. Usage
Open your browser and go to http://localhost:5174 (or the port shown in your terminal).
Click "Login with Google" to authenticate.
Add, view, and delete your notes!
🛡️ Security Highlights
- JWT token authentication and secure session secrets
- User data isolation (users can only access their own notes)
- Rate limiting and CORS protection
- Secure HTTP headers with Helmet
- OAuth 2.0 integration with Google
📹 Demo Video
A demo video is included in the repository (or will be shared separately) demonstrating:

- OAuth login flow
- Creating, viewing, and deleting notes
- Technical overview and design decisions
🙌 Contributing
Pull requests and suggestions are welcome!
📄 License
MIT