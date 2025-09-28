import { NextResponse } from 'next/server';
import { rooms } from '../../create/route.js';

export async function GET(request, { params }) {
  try {
    const { roomId } = params;

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get room information
    const room = rooms.get(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        status: room.status,
        hostId: room.hostId,
        hostName: room.hostName,
        participants: Array.from(room.participants.values()),
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting room info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
