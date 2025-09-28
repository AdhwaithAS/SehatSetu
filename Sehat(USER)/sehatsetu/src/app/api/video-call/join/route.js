import { NextResponse } from 'next/server';
import { rooms } from '../create/route.js';

export async function POST(request) {
  try {
    const { roomId, participantId, participantName } = await request.json();

    if (!roomId || !participantId || !participantName) {
      return NextResponse.json(
        { success: false, error: 'Room ID, participant ID and name are required' },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = rooms.get(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room is still waiting for participants
    if (room.status !== 'waiting') {
      return NextResponse.json(
        { success: false, error: 'Room is not available for joining' },
        { status: 400 }
      );
    }

    // Add participant to room
    room.participants.set(participantId, {
      id: participantId,
      name: participantName,
      joinedAt: new Date().toISOString()
    });

    // Update room status if this is the second participant
    if (room.participants.size >= 2) {
      room.status = 'active';
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        status: room.status,
        hostId: room.hostId,
        hostName: room.hostName,
        participants: Array.from(room.participants.values())
      }
    });

  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
