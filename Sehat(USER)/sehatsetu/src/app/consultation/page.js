"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import styles from "./consultation.module.css";

export default function ConsultationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urgency = searchParams.get('urgency');
  const [isCreatingCall, setIsCreatingCall] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const getUrgencyInfo = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return {
          title: 'Emergency Consultation',
          description: 'Your emergency consultation has been booked. A doctor will contact you shortly.',
          icon: '🚨',
          color: 'danger'
        };
      case 'checkup':
        return {
          title: 'Regular Checkup',
          description: 'Your checkup consultation has been scheduled. Please wait for the doctor to join.',
          icon: '🩺',
          color: 'primary'
        };
      case 'query':
        return {
          title: 'General Query',
          description: 'Your general query consultation is being processed. A healthcare professional will assist you.',
          icon: '💬',
          color: 'info'
        };
      default:
        return {
          title: 'Consultation',
          description: 'Your consultation is being processed.',
          icon: '🩺',
          color: 'primary'
        };
    }
  };

  const urgencyInfo = getUrgencyInfo(urgency);

  // Generate random host details
  const generateRandomHostDetails = () => {
    const doctorNames = [
      'Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Rodriguez', 
      'Dr. David Kumar', 'Dr. Lisa Thompson', 'Dr. James Wilson',
      'Dr. Maria Garcia', 'Dr. Robert Brown', 'Dr. Jennifer Lee',
      'Dr. Christopher Davis'
    ];
    
    const randomName = doctorNames[Math.floor(Math.random() * doctorNames.length)];
    const randomId = 'dr-' + Math.random().toString(36).substr(2, 9);
    
    return { hostId: randomId, hostName: randomName };
  };

  // Create video call with random host details
  const handleStartVideoCall = async () => {
    setIsCreatingCall(true);
    
    try {
      const { hostId, hostName } = generateRandomHostDetails();
      
      const response = await fetch('/api/video-call/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId,
          hostName
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to video call as host
        router.push(`/consultation/videoCall?roomId=${data.roomId}&role=host&id=${encodeURIComponent(hostId)}&name=${encodeURIComponent(hostName)}`);
      } else {
        console.error('Failed to create video call:', data.error);
        alert('Failed to create video call. Please try again.');
      }
    } catch (error) {
      console.error('Error creating video call:', error);
      alert('Error creating video call. Please try again.');
    } finally {
      setIsCreatingCall(false);
    }
  };

  // Handle reschedule functionality
  const handleReschedule = () => {
    setIsRescheduling(true);
    
    // Simulate reschedule process
    setTimeout(() => {
      alert('Your consultation has been rescheduled. You will receive a confirmation shortly.');
      setIsRescheduling(false);
      // In a real app, this would update the database and send notifications
    }, 1500);
  };

  return (
    <div className="container-fluid">
      <header className="pt-3 pb-2">
        <div className="d-flex align-items-center gap-2">
          <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="h4 m-0">SehatSetu Consultation</h1>
        </div>
      </header>

      <main className="container px-3">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body text-center p-4">
                <div className={`${styles.urgencyIcon} mb-3`}>
                  {urgencyInfo.icon}
                </div>
                <h2 className={`h4 mb-3 text-${urgencyInfo.color}`}>
                  {urgencyInfo.title}
                </h2>
                <p className="text-muted mb-4">
                  {urgencyInfo.description}
                </p>
                
                {urgency && (
                  <div className={`alert alert-${urgencyInfo.color} mb-4`}>
                    <strong>Urgency Level:</strong> {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </div>
                )}

                <div className="d-grid gap-2">
                  <Link href="/consultation/videoCall" className="btn btn-primary">
                    Start Video Call
                  </Link>
                  <Link href="/video-call-demo" className="btn btn-outline-primary">
                    Demo Video Call
                  </Link>
                  <button className="btn btn-outline-secondary">
                    Reschedule
                  </button>
                  <Link href="/dashboard" className="btn btn-outline-secondary">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
