"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";
import styles from "./videoCall.module.css";

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const role = searchParams.get('role');
  const userId = searchParams.get('id') || 'user-' + Math.random().toString(36).substr(2, 9);
  const userName = searchParams.get('name') || (role === 'host' ? 'Dr. Smith' : 'Patient');
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraSwitched, setIsCameraSwitched] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);
  const [isUserFullscreen, setIsUserFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!roomId) {
      setConnectionStatus('No room ID provided');
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('Connected to server');
      
      // Join room
      socket.emit('join-room', {
        roomId,
        userId,
        userName,
        role
      });
    });

    socket.on('room-joined', (data) => {
      console.log('Joined room:', data);
      setIsConnected(true);
      setConnectionStatus('Waiting for other participant...');
      initializeWebRTC();
    });

    socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      setRemoteUser(data);
      setConnectionStatus('Connected');
    });

    socket.on('offer', async (data) => {
      console.log('Received offer:', data);
      await handleOffer(data.offer, data.fromUserId);
    });

    socket.on('answer', async (data) => {
      console.log('Received answer:', data);
      await handleAnswer(data.answer);
    });

    socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate:', data);
      await handleIceCandidate(data.candidate);
    });

    socket.on('user-left', (data) => {
      console.log('User left:', data);
      setRemoteUser(null);
      setConnectionStatus('Other participant left');
    });

    socket.on('call-ended', (data) => {
      console.log('Call ended:', data);
      handleEndCall();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('Disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId, userName, role]);

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (isCallActive && isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, isConnected]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(rtcConfig);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote stream');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
            targetUserId: remoteUser?.userId
          });
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current.connectionState);
        if (peerConnectionRef.current.connectionState === 'connected') {
          setConnectionStatus('Connected');
        } else if (peerConnectionRef.current.connectionState === 'disconnected') {
          setConnectionStatus('Disconnected');
        }
      };

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setConnectionStatus('Error accessing camera/microphone');
    }
  };

  // Handle incoming offer
  const handleOffer = async (offer, fromUserId) => {
    try {
      if (!peerConnectionRef.current) {
        await initializeWebRTC();
      }

      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        roomId,
        answer,
        targetUserId: fromUserId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  // Handle incoming answer
  const handleAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  // Create offer (for host)
  const createOffer = async () => {
    try {
      if (!peerConnectionRef.current) {
        await initializeWebRTC();
      }

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        roomId,
        offer,
        targetUserId: remoteUser?.userId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Notify other participants
    if (socketRef.current) {
      socketRef.current.emit('end-call', { roomId, userId });
    }
    
    console.log("Call ended");
  };

  const handleVideoToggle = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    
    // Toggle video track
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoState;
      }
    }
    
    // Notify other participants
    if (socketRef.current) {
      socketRef.current.emit('toggle-video', {
        roomId,
        userId,
        isVideoOn: newVideoState
      });
    }
  };

  const handleMicToggle = () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    
    // Toggle audio track
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newMicState;
      }
    }
    
    // Notify other participants
    if (socketRef.current) {
      socketRef.current.emit('toggle-mute', {
        roomId,
        userId,
        isMuted: !newMicState
      });
    }
  };

  const handleCameraSwitch = () => {
    setIsCameraSwitched(!isCameraSwitched);
    // In a real implementation, this would switch between front/back camera
    console.log("Camera switched");
  };

  const handleFullscreenToggle = () => {
    setIsUserFullscreen(!isUserFullscreen);
  };

  // Start call when remote user joins
  useEffect(() => {
    if (remoteUser && role === 'host') {
      createOffer();
    }
  }, [remoteUser, role]);

  return (
    <div className={styles.videoCallContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.callInfo}>
          <h2 className={styles.callTitle}>Video Consultation</h2>
          <div className={styles.callDuration}>
            {isCallActive ? formatTime(callDuration) : "Call Ended"}
          </div>
          <div className={styles.connectionStatus}>
            {connectionStatus}
          </div>
        </div>
        <Link href="/consultation" className={styles.backButton}>
          ← Back
        </Link>
      </div>

      {/* Video Grid */}
      <div className={`${styles.videoGrid} ${isUserFullscreen ? styles.userFullscreen : ''}`}>
        {/* Remote Video (Doctor) */}
        <div className={`${styles.videoContainer} ${styles.remoteVideo} ${isUserFullscreen ? styles.remoteVideoSmall : ''}`}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={styles.videoElement}
            style={{ display: remoteUser ? 'block' : 'none' }}
          />
          {!remoteUser && (
            <div className={styles.videoPlaceholder}>
              <div className={styles.videoFeed}>
                <div className={styles.doctorAvatar}>👨‍⚕️</div>
                <div className={styles.participantName}>Waiting for doctor...</div>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (User) */}
        <div className={`${styles.videoContainer} ${styles.localVideo} ${isUserFullscreen ? styles.localVideoFull : ''}`}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.videoElement}
            style={{ display: isVideoOn ? 'block' : 'none' }}
          />
          {!isVideoOn && (
            <div className={styles.videoPlaceholder}>
              <div className={styles.videoOff}>
                <div className={styles.offIcon}>📹</div>
                <div className={styles.offText}>Video Off</div>
              </div>
            </div>
          )}
          {/* Fullscreen Toggle Button */}
          <button 
            className={styles.fullscreenToggle}
            onClick={handleFullscreenToggle}
            title={isUserFullscreen ? "Show doctor fullscreen" : "Show you fullscreen"}
          >
            {isUserFullscreen ? "🔍" : "⛶"}
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className={styles.controlPanel}>
        <div className={styles.controls}>
          {/* Mic Toggle */}
          <button 
            className={`${styles.controlButton} ${!isMicOn ? styles.controlButtonActive : ''}`}
            onClick={handleMicToggle}
            title={isMicOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isMicOn ? "🎤" : "🔇"}
          </button>

          {/* Video Toggle */}
          <button 
            className={`${styles.controlButton} ${!isVideoOn ? styles.controlButtonActive : ''}`}
            onClick={handleVideoToggle}
            title={isVideoOn ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoOn ? "📹" : "📷"}
          </button>

          {/* Camera Switch */}
          <button 
            className={styles.controlButton}
            onClick={handleCameraSwitch}
            title="Switch camera"
          >
            🔄
          </button>

          {/* End Call */}
          <button 
            className={`${styles.controlButton} ${styles.endCallButton}`}
            onClick={handleEndCall}
            title="End call"
          >
            📞
          </button>
        </div>

        {/* Call Status */}
        <div className={styles.callStatus}>
          {!isMicOn && <span className={styles.statusBadge}>🔇 Muted</span>}
          {!isVideoOn && <span className={styles.statusBadge}>📹 Camera Off</span>}
          {isCameraSwitched && <span className={styles.statusBadge}>🔄 Camera Switched</span>}
        </div>
      </div>

    </div>
  );
}
