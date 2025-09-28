import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for rooms (in production, use a database)
const rooms = new Map();

export async function POST(request) {
  try {
    const { hostId, hostName } = await request.json();

    if (!hostId || !hostName) {
      return NextResponse.json(
        { success: false, error: 'Host ID and name are required' },
        { status: 400 }
      );
    }

    // Generate unique room ID
    const roomId = uuidv4();

    // Create room object
    const room = {
      id: roomId,
      hostId,
      hostName,
      status: 'waiting',
      participants: new Map(),
      createdAt: new Date().toISOString()
    };

    // Store room
    rooms.set(roomId, room);

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const hostLink = `${baseUrl}/consultation/videoCall?roomId=${roomId}&role=host&id=${encodeURIComponent(hostId)}&name=${encodeURIComponent(hostName)}`;
    const guestLink = `${baseUrl}/consultation/videoCall?roomId=${roomId}&role=guest`;

    return NextResponse.json({
      success: true,
      roomId,
      hostLink,
      guestLink,
      room: {
        id: room.id,
        status: room.status,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export rooms for use in other API routes
export { rooms };
