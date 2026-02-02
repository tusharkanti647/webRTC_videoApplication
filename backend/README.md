# WebRTC Video Application - Backend

## Overview

This backend service powers a WebRTC-based video communication platform, enabling users to connect in virtual rooms for real-time audio and video interactions. It handles all essential functionalities such as user authentication, room creation, participant management, WebRTC signaling, and real-time communication using Socket.IO.

The service ensures secure access through JWT-based authentication stored in HTTP-only cookies, allows hosts to control participants in their rooms, and supports Google OAuth login for seamless authentication. Additionally, it can send email notifications to invited participants with join links, making collaboration and video meetings easier and efficient.

This backend is built with Node.js, Express, MongoDB, and integrates smoothly with frontend applications for a full-featured video conferencing solution.

## Features

1. User Authentication and Management
 - Register new users using email/password or Google OAuth.
 - Login and logout functionality with secure JWT cookies.
 - Authentication checks for protected routes.
 - Persistent session management with cookie-based tokens.
 - Easy integration for frontend login and signup flows.

2. Room Creation and Management
 - Users can create rooms and invite others via email.
 - Automatic generation of unique room join URLs.
 - Stores host and participant information in MongoDB.
 - Fetch room details for frontend display.

3. Real-Time Communication with Socket.IO
 - Real-time updates for audio/video status.
 - Hosts can mute or kick participants instantly.
 - Emits socket events to synchronize room state across all clients.
 - Handles WebRTC signaling and participant connection management.

4. Host Controls
 - Only the host can mute or kick participants.
 - Host actions emit real-time updates to participants.
 - Maintains participant state (e.g., audio enabled/disabled) in the database.
 - Improves meeting control and security.

5. Email Notifications
 - Send room join links to invited participants via email.
 - Customizable email content for invitations.
 - Facilitates easier onboarding for new users in a room.

6. User Profile Management
 - Stores user information such as name, email, and authentication method.
 - Supports updating and retrieving user data securely.
 - Tracks user session with JWT token verification.

7. Secure and Scalable Architecture
 - Built with Express.js for robust routing.
 - MongoDB for flexible and scalable data storage.
 - Socket.IO for efficient real-time communication.
 - Follows RESTful API design principles for easy frontend integration.

8. Developer-Friendly
 - Clean code structure with controllers, routes, and middleware separation.
 - Detailed API endpoints documented with request and response examples.
 - Easily extendable for new features like chat, screen sharing, or analytics.

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- MongoDB (using database)
- Environment variables configured

## Installation

1. **Clone the repository**

```bash
git clone <https://github.com/tusharkanti647/webRTC_videoApplication.git >
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**
   This project uses environment variables to manage configuration such as
   database connection, authentication secrets, frontend URL, and email service.

Follow the steps below to configure the `.env` file correctly.

batter understand check the `.env.example` file

## Project Structure

```
backend/
├── controllers/        # Business logic for routes
├── middlewares/        # Authentication and other middlewares
├── models/            # Database models (User, Room)
├── routes/            # API route definitions
├── socket/            # Socket.IO setup and handlers
├── utils/             # Utility functions (DB, Email)
├── postman_collection/# API documentation
└── index.js          # Application entry point
```

## API Endpoints

## 🔐 Authentication

- Authentication is handled using **JWT stored in HTTP-only cookies**
- Protected routes require a valid `JWTToken` cookie
- Middleware used: `isAuthenticated`

---

## 👤 User APIs (`/userApi`)

---

### User Routes

- `POST /userApi/signUp` - Register a new user

**Description**  
Registers a new user using email and password.

**Request Body**

```json
{
  "name": "Tushar",
  "email": "tushar@example.com",
  "password": "password123",
  "reyTypePassword": "password123"
}
```

**Success Response (200)**

```json
{
  "message": "Account created successfully",
  "success": true,
  "user": {
    "_id": "userId",
    "name": "Tushar",
    "email": "tushar@example.com"
  }
}
```

**Error Responses**

1. 400 → Missing fields
2. 409 → User already exists
3. 500 → Server error

- `POST /userApi/signIn` - Login user

**Description**
Logs in a user and sets JWT cookie.

**Request Body**

```json
{
  "email": "tushar@example.com",
  "password": "password123"
}
```

**Success Response (200)**

```json
{
  "message": "Welcome back Tushar",
  "success": true,
  "user": {
    "_id": "userId",
    "name": "Tushar",
    "email": "tushar@example.com"
  }
}
```

**Error Responses**

1. 400 → Missing credentials
2. 401 → Incorrect credentials

- `POST /userApi/googleSignIn` - Google Login

**Description**
Authenticates user using Google OAuth token.

**Request Body**

```json
{
  "googleToken": "GOOGLE_ID_TOKEN"
}
```

**Success Response (200)**

```json
{
  "message": "Welcome back Tushar",
  "success": true,
  "newUser": {
    "_id": "userId",
    "name": "Tushar",
    "email": "tushar@gmail.com"
  }
}
```

**Error Responses**

1. 500 → Internal server error

- `GET /userApi/authCheck` - Auth Check

**Description**
Checks whether the user is authenticated.

**Success Response (200)**

```json
{
  "authenticated": true,
  "user": "userId",
  "success": true
}
```

**Error Responses**

```json
{
  "authenticated": false,
  "success": false
}
```

- `GET /userApi/signOute` - Logout User

**Description**
Logs out the user by clearing JWT cookie.

**Success Response (200)**

```json
{
  "message": "Logged out successfully",
  "success": true
}
```

---

## 👤 Room Routes (`/roomsApi`)

---

- `POST /roomsApi/create` - Create Room

**Description**
Creates a new room by a logged-in user and optionally sends invite emails.

Authentication
✅ Required

**Request Body**

```json
{
  "romeName": "Team Meeting",
  "inviteEmails": ["user1@gmail.com", "user2@gmail.com"]
}
```

**Success Response (200)**

```json
{
  "romeId": "697dd63365838c93fccd3e9a",
  "joinUrl": "http://localhost:3000/join/697dd63365838c93fccd3e9a",
  "hostId": "userId"
}
```

**Error Responses**

1. 500 → Internal server error
2. 400 → Room name missing
3. 401 → Not authenticated

- `POST /roomsApi/kick/:id` - Host Kick Participant

**Description**
Allows the host to remove a participant from the room.

Authentication
✅ Required

URL Params
`id` → Room ID

**Request Body**

```json
{
  "socketId": "participantSocketId"
}
```

**Success Response (200)**

```json
{
  "success": true,
  "message": "PARTICIPANT REMOVED SUCCESSFULLY"
}
```

**Socket Events Emitted**

1. force-kick
2. kick-user-byHost

**Error Responses**

1. 500 → Internal server error
2. 403 → Not host
3. 404 → Room or participant not found

## Socket Events

### Client to Server

- `check-rome` - check rome id in db
- `join-call` - User joins a room
- `leave-room` - User leaves a room
- `signal` - WebRTC signaling data
- `host-user-mute` - Host mute the user
- `user-mute` - User mute
- `user-videoOff` - User off the vide
- `disconnect` - User disconnect in socket

read more about the sockets event go to the socket/socket.js file

### Server to Client

- `check-rome` - check rome id in db response
- `user-joined` - User joins a room response back to all user
- `user-left` - Notify about user leaving
- `signal` - Relay signaling data
- `host-user-mut` - Notify the host user muted
  `host-by-user-mute` - Notify the muted user, he muted by host
  `remote-user-mute` - Notify the other user, that 1 user muted
  `user-mute` - Notify the user USER MUTE EVENT
  `user-videoOff` - Notify the user USER video off EVENT
  `remote-user-videoOff` - Notify the other user, that 1 user video off

  read more about the sockets event go to the socket/socket.js file

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on the configured PORT (default: 5000).

## Authentication

The application uses JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database

### Models

- **User Model**: Stores user information, credentials, and preferences
- **Room Model**: Manages room data, participants, and metadata

## Socket.IO Configuration

- Real-time bi-directional communication
- Namespace-based room management
- Automatic disconnect handling

## Email Service

Configured for sending notifications:

- Room invitations

## Error Handling

- Validation error responses
- Database error management

## Security Features

- JWT authentication
- Password encryption
- Input validation
- CORS configuration

## Dependencies

Key packages used:

- `express` - Web framework
- `socket.io` - Real-time communication
- `jsonwebtoken` - JWT authentication
- `mongoose` - MongoDB ODM (if applicable)
- `nodemailer` - Email service
- `dotenv` - Environment configuration
- `mongoose` - Mongodb operation handel

## Troubleshooting

### Connection Issues

- Check if server is running on correct port
- Verify environment variables are set
- Check network connectivity
- If the app is deployed on a server, update CORS and cookie settings because production (HTTPS) behavior is different from local development.

### Socket Connection Failed

- Ensure Socket.IO is properly configured
- Check CORS settings
- Verify client connection parameters
