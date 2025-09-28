'use client';

import { useState } from 'react';
import { useVideocall } from '../../hooks/useVideocall';
import styles from './videoCall.module.css';

export default function VideoCall() {
  const [roomId, setRoomId] = useState('');
  const [isInCall, setIsInCall] = useState(false);

  const {
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isCallActive,
    isConnected,
    error,
    isLoading,
    localVideoRef,
    remoteVideoRef,
    startCall,
    joinRoom,
    endCall,
    createRoom,
    toggleMute,
    toggleVideo,
    reconnect,
    clearError
  } = useVideocall(roomId);

  const handleJoinRoom = async () => {
    if (roomId.trim()) {
      const success = await joinRoom(roomId);
      if (success) {
        setIsInCall(true);
      }
    }
  };

  const handleCreateRoom = async () => {
    const newRoomId = await createRoom();
    if (newRoomId) {
      setRoomId(newRoomId);
      setIsInCall(true);
    }
  };

  const handleEndCall = () => {
    endCall();
    setIsInCall(false);
    setRoomId('');
  };

  if (!isInCall) {
    return (
      <div className={styles.container}>
        <div className={styles.joinContainer}>
          <h1 className={styles.title}>Video Call</h1>
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button onClick={clearError} className={styles.closeError}>×</button>
            </div>
          )}
          
          {!isConnected && (
            <div className={styles.connectionStatus}>
              <p>Connecting to server...</p>
              <button onClick={reconnect} className={styles.reconnectButton}>
                Retry Connection
              </button>
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={styles.roomInput}
              disabled={isLoading}
            />
            <button 
              onClick={handleJoinRoom} 
              className={styles.joinButton}
              disabled={isLoading || !isConnected}
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
          <div className={styles.divider}>OR</div>
          <button 
            onClick={handleCreateRoom} 
            className={styles.createButton}
            disabled={isLoading || !isConnected}
          >
            {isLoading ? 'Creating...' : 'Create New Room'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.videoContainer}>
        {/* Remote Video */}
        <div className={styles.remoteVideoContainer}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={styles.remoteVideo}
          />
          {!remoteStream && (
            <div className={styles.waitingMessage}>
              Waiting for other participant...
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className={styles.localVideoContainer}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.localVideo}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className={styles.controlBar}>
        <button
          onClick={toggleMute}
          className={`${styles.controlButton} ${isMuted ? styles.muted : ''}`}
        >
          {isMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`${styles.controlButton} ${isVideoOff ? styles.videoOff : ''}`}
        >
          {isVideoOff ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2zM5 16V8h1.73l8 8H5z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          )}
        </button>

        <button
          onClick={handleEndCall}
          className={`${styles.controlButton} ${styles.endCall}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
          </svg>
        </button>
      </div>

      {/* Room ID Display */}
      <div className={styles.roomInfo}>
        Room ID: {roomId}
      </div>
    </div>
  );
}
