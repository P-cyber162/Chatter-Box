import { Server, Socket } from 'socket.io';
import { prisma } from '../config/prisma.js';

interface RoomUser {
    userId: string;
    username: string;
    socketId: string;
}

interface RoomState {
    [roomId: string]: RoomUser[];
}

const roomState: RoomState = {};

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.emit('welcome', 'Welcome to Chatter-Box!');

        // User joins a room
        socket.on('join-room', async (data: { roomId: string; userId: string; username: string }) => {
            const { roomId, userId, username } = data;

            socket.join(roomId);

            if (!roomState[roomId]) {
                roomState[roomId] = [];
            }

            roomState[roomId].push({
                userId,
                username,
                socketId: socket.id
            });

            console.log(`${username} joined room ${roomId}`);

            io.to(roomId).emit('user-joined', {
                username,
                activeUsers: roomState[roomId].length,
                message: `${username} joined the room`
            });
        });

        // Send message to room
        socket.on('send-message', (data: { roomId: string; text: string; username: string }) => {
            const { roomId, text, username } = data;

            io.to(roomId).emit('receive-message', {
                text,
                username,
                timestamp: new Date()
            });

            console.log(`Message in room ${roomId}: ${text}`);
        });

        // Send reaction to room
        socket.on('send-reaction', (data: { roomId: string; messageId: string; emoji: string; username: string }) => {
            const { roomId, messageId, emoji, username } = data;

            io.to(roomId).emit('receive-reaction', {
                messageId,
                emoji,
                username,
                timestamp: new Date()
            });

            console.log(`Reaction in room ${roomId}: ${emoji} from ${username}`);
        });

        // User leaves room
        socket.on('leave-room', (data: { roomId: string; username: string }) => {
            const { roomId, username } = data;

            if (roomState[roomId]) {
                roomState[roomId] = roomState[roomId].filter(
                    user => user.socketId !== socket.id
                );
            }

            socket.leave(roomId);

            const activeUsersCount = roomState[roomId]?.length || 0;

            io.to(roomId).emit('user-left', {
                username,
                activeUsers: activeUsersCount,
                message: `${username} left the room`
            });

            console.log(`${username} left room ${roomId}`);
        });

        // Disconnect
        socket.on('disconnect', () => {
            for (const roomId in roomState) {
                const users = roomState[roomId];
                if (!users) continue;

                const userIndex = users.findIndex(
                    user => user.socketId === socket.id
                );

                if (userIndex !== -1) {
                    const username = users[userIndex]?.username;
                    users.splice(userIndex, 1);

                    io.to(roomId).emit('user-left', {
                        username,
                        activeUsers: users.length,
                        message: `${username} left the room`
                    });
                }
            }

            console.log('User disconnected:', socket.id);
        });
    });
};

export const getRoomUsers = (roomId: string): RoomUser[] => {
    return roomState[roomId] || [];
};
