# Video Call Application

A modern, Google Meet-like video calling application built with Next.js, Socket.IO, and WebRTC.

## Features

- 🎥 **Real-time Video Calls** - High-quality video streaming using WebRTC
- 🎤 **Audio Controls** - Mute/unmute functionality
- 📹 **Video Controls** - Turn camera on/off
- 🏠 **Room-based Calls** - Create or join rooms with unique IDs
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Light theme with Google Meet-inspired design
- ⚡ **Real-time Signaling** - Socket.IO for seamless connection establishment

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Application

Run both the Socket.IO server and Next.js development server:

```bash
npm run dev:full
```

This will start:
- Socket.IO server on `http://localhost:3001`
- Next.js app on `http://localhost:3000`

### 3. Access the Video Call

Navigate to `http://localhost:3000/video-call` in your browser.

## Usage

### Creating a Room

1. Click "Create New Room"
2. Share the generated Room ID with other participants
3. Wait for others to join

### Joining a Room

1. Enter the Room ID provided by the room creator
2. Click "Join Room"
3. Allow camera and microphone permissions when prompted

### During the Call

- **Mute/Unmute**: Click the microphone button
- **Turn Video On/Off**: Click the camera button
- **End Call**: Click the red phone button

## Custom Hook Usage

The application includes a custom hook `useVideocall` that you can use in other components:

```javascript
import { useVideocall } from '../hooks/useVideocall';

function MyVideoComponent() {
  const {
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isCallActive,
    localVideoRef,
    remoteVideoRef,
    joinRoom,
    endCall,
    toggleMute,
    toggleVideo
  } = useVideocall('room-id');

  // Your component logic here
}
```

### Hook API

| Property | Type | Description |
|----------|------|-------------|
| `localStream` | MediaStream | Local video/audio stream |
| `remoteStream` | MediaStream | Remote participant's stream |
| `isMuted` | boolean | Whether audio is muted |
| `isVideoOff` | boolean | Whether video is disabled |
| `isCallActive` | boolean | Whether call is in progress |
| `isConnected` | boolean | Socket connection status |
| `error` | string | Error message if any |
| `isLoading` | boolean | Loading state |
| `localVideoRef` | RefObject | Reference for local video element |
| `remoteVideoRef` | RefObject | Reference for remote video element |
| `joinRoom` | Function | Join a room by ID |
| `endCall` | Function | End the current call |
| `createRoom` | Function | Create a new room |
| `toggleMute` | Function | Toggle audio mute |
| `toggleVideo` | Function | Toggle video on/off |
| `reconnect` | Function | Reconnect to server |
| `clearError` | Function | Clear error messages |

## Architecture

### Frontend (Next.js)
- **Video Call Page**: Main video calling interface
- **Custom Hook**: Reusable video call logic
- **Socket.IO Client**: Real-time communication

### Backend (Socket.IO Server)
- **Signaling Server**: Handles WebRTC signaling
- **Room Management**: Manages room participants
- **Event Handling**: Processes join/leave/offer/answer events

### WebRTC Flow
1. **User joins room** → Socket emits 'join-room'
2. **Peer connection established** → Creates RTCPeerConnection
3. **Offer/Answer exchange** → Via Socket.IO signaling
4. **ICE candidates** → Exchanged for NAT traversal
5. **Media streaming** → Direct peer-to-peer connection

## Browser Requirements

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11+)
- **Mobile browsers**: Supported

## Permissions

The application requires:
- **Camera access** for video streaming
- **Microphone access** for audio streaming
- **Network access** for Socket.IO connection

## Troubleshooting

### Connection Issues
- Ensure Socket.IO server is running on port 3001
- Check firewall settings
- Verify network connectivity

### Media Issues
- Grant camera/microphone permissions
- Check device availability
- Try refreshing the page

### Browser Issues
- Use HTTPS in production
- Enable WebRTC in browser settings
- Update browser to latest version

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy Socket.IO server** to your hosting platform
3. **Deploy Next.js app** to Vercel, Netlify, or similar
4. **Update Socket.IO URL** in the hook for production

## Security Considerations

- Use HTTPS in production
- Implement authentication if needed
- Add rate limiting to Socket.IO server
- Validate room IDs and user inputs

## License

This project is open source and available under the MIT License.
