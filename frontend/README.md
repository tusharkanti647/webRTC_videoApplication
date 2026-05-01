# WebRTC Video Application - Frontend

## Overview

This is a React-based frontend application for a WebRTC-powered video communication platform. It provides an intuitive and responsive user interface for video conferencing, user authentication, and real-time interaction between participants.

The frontend communicates with the backend using REST APIs for authentication and room management, and Socket.IO for real-time updates such as participant status, mute/kick actions, and room events. WebRTC is used to establish peer-to-peer audio and video streams, enabling low-latency, real-time communication.

The application supports email/password login, Google OAuth authentication, and offers host-specific controls for managing participants inside a room. The UI is built using Material UI (MUI) to ensure a clean, modern, and responsive design across devices.

## Features

- User authentication and signup
- Google Sign-In integration
- Real-time video conferencing
- Room creation and joining
- Live user presence
- Responsive design
- Socket.IO integration for real-time updates

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Modern web browser with WebRTC support

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/tusharkanti647/webRTC_videoApplication.git
cd frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=<your-google-client-id>
```

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── Components/
│   │   ├── LandingPage/    # Home page
│   │   ├── loginSignup/    # Authentication pages
│   │   ├── Room/           # Video conferencing room
│   │   └── NotFoundPage.js # 404 page
│   ├── socket/             # Socket.IO setup and providers
│   ├── App.js              # Main application component
│   ├── index.js            # React entry point
│   └── css files           # Styling
└── package.json
```

## Running the Application

### Development Mode

```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Core Components

### Landing Page

- Welcome screen
- Navigation to login/signup
- Feature overview

### Login & Signup

- Email and password authentication
- Google Sign-In integration
- Form validation
- Private route protection
- create a new rome host
- join the rome used rome id
- join using the rome url user

### Video Room

- Real-time video display
- Peer-to-peer connections
- User list
- Stream controls
- Leave room functionality
- mute and video off self
- host kik user and mute

### Socket Provider

- Global Socket.IO context
- Connection management
- Event handling
- Real-time updates

## Authentication Flow

1. User registers with email/password or Google
2. JWT token received and stored
3. Token included in subsequent requests
4. Private routes protected via `PrivateRoute` component
5. Automatic redirect to login if unauthorized

## WebRTC Setup

- **RTCPeerConnection**: Manages peer connections
- **MediaStream**: Captures and displays local/remote streams
- **Signaling**: Handled via Socket.IO events
- **ICE Candidates**: Automatically gathered and exchanged

## Socket.IO Events

check backend README.md file

## Styling

- CSS modules for component-specific styles
- Responsive design for mobile and desktop
- Clean and modern UI

## Key Libraries

- `react` - UI library
- `react-dom` - React rendering
- `react-router-dom` - Routing
- `socket.io-client` - Real-time communication
- `@mui/icons-material` - Material UI icons
- `@mui/material` - Material UI core components
- `axios` - HTTP client for API requests
- `@react-oauth/google` – Google OAuth authentication
- `react-router` – Core routing utilities
- CSS Modules - Component styling

3. **Configure environment variables**
   This project uses environment variables to manage configuration such as
   google authentycat client id and secret, frontend URL, backend url.

Follow the steps below to configure the `.env` file correctly.

batter understand check the `.env.example` file

## Common Issues

### Camera/Microphone Not Working

- Check browser permissions
- Verify camera is not in use by another app
- Ensure HTTPS in production (WebRTC requires secure context)

### Connection Failed

- Verify backend server is running
- Check API and Socket URLs in .env
- Look for CORS issues in browser console

### Video Not Displaying

- Check WebRTC constraints
- Ensure peer connection is established
- Verify stream is added to peer connection

## Performance Tips

- Minimize re-renders using React.memo
- Use useCallback for event handlers
- Optimize video stream quality
- Implement lazy loading for routes

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Deployment

1. Build the production version
2. Deploy to hosting service (Vercel, Netlify, GitHub Pages, etc.)
3. Update `REACT_APP_API_URL` for production backend
4. Configure domain in Google OAuth settings
