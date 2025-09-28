import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

export const useVideocall = (roomId, socketUrl = 'http://localhost:3001') => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize socket connection
  useEffect(() => {
    if (!socketUrl) return;

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: false
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server');
      setIsConnected(false);
    });

    newSocket.on('user-joined', async (userId) => {
      console.log('User joined:', userId);
      if (peerConnectionRef.current) {
        await createOffer();
      }
    });

    newSocket.on('offer', async (offer) => {
      await handleOffer(offer);
    });

    newSocket.on('answer', async (answer) => {
      await handleAnswer(answer);
    });

    newSocket.on('ice-candidate', async (candidate) => {
      await handleIceCandidate(candidate);
    });

    newSocket.on('user-left', () => {
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    return () => {
      newSocket.close();
    };
  }, [socketUrl]);

  const createPeerConnection = useCallback(async () => {
    try {
      peerConnectionRef.current = new RTCPeerConnection(iceServers);

      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, localStream);
        });
      }

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', event.candidate);
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current.connectionState);
        if (peerConnectionRef.current.connectionState === 'failed') {
          setError('Connection failed. Please try again.');
        }
      };

      return true;
    } catch (err) {
      console.error('Error creating peer connection:', err);
      setError('Failed to create peer connection');
      return false;
    }
  }, [localStream]);

  const startCall = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const success = await createPeerConnection();
      if (success) {
        setIsCallActive(true);
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Error accessing camera/microphone. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [createPeerConnection]);

  const joinRoom = useCallback(async (roomIdToJoin = roomId) => {
    if (!roomIdToJoin || !socketRef.current) {
      setError('Room ID and socket connection required');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Connect socket if not connected
      if (!isConnected) {
        socketRef.current.connect();
        // Wait for connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
          socketRef.current.once('connect', () => {
            clearTimeout(timeout);
            resolve();
          });
          socketRef.current.once('connect_error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      }

      socketRef.current.emit('join-room', roomIdToJoin);
      await startCall();
      return true;
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [roomId, isConnected, startCall]);

  const createOffer = useCallback(async () => {
    try {
      if (!peerConnectionRef.current || !socketRef.current) return;

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.emit('offer', offer);
    } catch (err) {
      console.error('Error creating offer:', err);
      setError('Failed to create offer');
    }
  }, []);

  const handleOffer = useCallback(async (offer) => {
    try {
      if (!peerConnectionRef.current || !socketRef.current) return;

      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socketRef.current.emit('answer', answer);
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to handle offer');
    }
  }, []);

  const handleAnswer = useCallback(async (answer) => {
    try {
      if (!peerConnectionRef.current) return;

      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Failed to handle answer');
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      if (!peerConnectionRef.current) return;

      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  const endCall = useCallback(() => {
    try {
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Leave room
      if (socketRef.current) {
        socketRef.current.emit('leave-room');
      }
      
      // Reset state
      setLocalStream(null);
      setRemoteStream(null);
      setIsCallActive(false);
      setIsMuted(false);
      setIsVideoOff(false);
      setError(null);
    } catch (err) {
      console.error('Error ending call:', err);
      setError('Failed to end call properly');
    }
  }, [localStream]);

  const createRoom = useCallback(async () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    const success = await joinRoom(newRoomId);
    return success ? newRoomId : null;
  }, [joinRoom]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [endCall]);

  return {
    // State
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isCallActive,
    isConnected,
    error,
    isLoading,
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    
    // Actions
    startCall,
    joinRoom,
    endCall,
    createRoom,
    toggleMute,
    toggleVideo,
    reconnect,
    
    // Utilities
    clearError: () => setError(null)
  };
};
