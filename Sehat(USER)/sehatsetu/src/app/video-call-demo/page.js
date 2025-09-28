"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./demo.module.css";

export default function VideoCallDemo() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [formData, setFormData] = useState({
    hostId: '',
    hostName: '',
    participantId: '',
    participantName: '',
    roomId: ''
  });

  const handleCreateRoom = async () => {
    if (!formData.hostId || !formData.hostName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:3001/api/video-call/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId: formData.hostId,
          hostName: formData.hostName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Navigate to host video call page
        router.push(`/consultation/videoCall?roomId=${data.roomId}&role=host&id=${encodeURIComponent(formData.hostId)}&name=${encodeURIComponent(formData.hostName)}`);
      } else {
        alert('Error creating room: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error creating room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!formData.roomId || !formData.participantId || !formData.participantName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch('http://localhost:3001/api/video-call/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: formData.roomId,
          participantId: formData.participantId,
          participantName: formData.participantName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Navigate to guest video call page
        router.push(`/consultation/videoCall?roomId=${formData.roomId}&role=guest&id=${encodeURIComponent(formData.participantId)}&name=${encodeURIComponent(formData.participantName)}`);
      } else {
        alert('Error joining room: ' + data.error);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error joining room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={styles.demoContainer}>
      <div className={styles.demoCard}>
        <h1 className={styles.title}>SehatSetu Video Call Demo</h1>
        <p className={styles.subtitle}>Test the P2P video calling system</p>

        <div className={styles.section}>
          <h2>Create a Room (Host)</h2>
          <div className={styles.formGroup}>
            <label>Host ID:</label>
            <input
              type="text"
              value={formData.hostId}
              onChange={(e) => setFormData({...formData, hostId: e.target.value})}
              placeholder="e.g., doctor123"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Host Name:</label>
            <input
              type="text"
              value={formData.hostName}
              onChange={(e) => setFormData({...formData, hostName: e.target.value})}
              placeholder="e.g., Dr. Smith"
            />
          </div>
          <button 
            className={styles.createButton}
            onClick={handleCreateRoom}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.section}>
          <h2>Join a Room (Guest)</h2>
          <div className={styles.formGroup}>
            <label>Room ID:</label>
            <input
              type="text"
              value={formData.roomId}
              onChange={(e) => setFormData({...formData, roomId: e.target.value})}
              placeholder="Enter room ID from host"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Participant ID:</label>
            <input
              type="text"
              value={formData.participantId}
              onChange={(e) => setFormData({...formData, participantId: e.target.value})}
              placeholder="e.g., patient456"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Participant Name:</label>
            <input
              type="text"
              value={formData.participantName}
              onChange={(e) => setFormData({...formData, participantName: e.target.value})}
              placeholder="e.g., John Doe"
            />
          </div>
          <button 
            className={styles.joinButton}
            onClick={handleJoinRoom}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </div>

        <div className={styles.info}>
          <h3>Instructions:</h3>
          <ol>
            <li>Host creates a room and gets a Room ID</li>
            <li>Host shares the Room ID with the guest</li>
            <li>Guest joins using the Room ID</li>
            <li>Both participants will be connected via WebRTC</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
