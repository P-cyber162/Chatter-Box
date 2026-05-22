import { Server, Socket } from 'socket.io';
import type { Request, Response } from 'express';
import { sendMessage, sendReaction } from '../controllers/messageController.js';
import { prisma } from '../config/prisma.js';

interface RoomUser {
    userId: string;
    username: string;
    socketId: string;
};

interface RoomState {
    [roomId: string]: RoomUser[];
};

const roomState: RoomState = {};

// Helper to create mock Request/Response for controller functions
const createMockRequest = (body: any = {}, params: any = {}) => {
    return {
        body,
        params
    } as any as Request;
};

const createMockResponse = () => {
    let responseData: any = null;

    return {
        status: (code: number) => ({
            json: (data: any) => {
                responseData = data;
                return data;
            }
        }),
        getResponse: () => responseData
    } as any as Response & { getResponse: () => any };
};

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

        // Send message to room - CALLS CONTROLLER FUNCTION
        socket.on('send-message', async (data: { roomId: string; userId: string; text: string; username: string }) => {
            try {
                const { roomId, userId, text, username } = data;

                // Create mock request/response for controller
                const mockReq = createMockRequest({ userId, text });
                const mockRes = createMockResponse();

                // Call the controller function
                await sendMessage(mockReq, mockRes);

                const response = (mockRes as any).getResponse();

                if (response?.status === 'success') {
                    const message = response.message;
                    
                    // Broadcast saved message to all clients in room
                    io.to(roomId).emit('receive-message', {
                        id: message.id,
                        text: message.text,
                        username: username,
                        userId: userId,
                        timestamp: message.sentAt
                    });

                    console.log(`Message saved in room ${roomId}: ${text}`);
                } else {
                    socket.emit('error', { message: 'Failed to send message' });
                }
            } catch (error: any) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: error.message || 'Failed to send message' });
            }
        });

        // Send reaction to room - CALLS CONTROLLER FUNCTION
        socket.on('send-reaction', async (data: { roomId: string; messageId: string; emoji: string; username: string }) => {
            try {
                const { roomId, messageId, emoji, username } = data;

                // Create mock request/response for controller
                const mockReq = createMockRequest({ emoji }, { messageId });
                const mockRes = createMockResponse();

                // Call the controller function
                await sendReaction(mockReq, mockRes);

                const response = (mockRes as any).getResponse();

                if (response?.status === 'success') {
                    const reaction = response.reaction;
                    
                    // Broadcast reaction to all clients in room
                    io.to(roomId).emit('receive-reaction', {
                        id: reaction.id,
                        messageId: messageId,
                        emoji: emoji,
                        username: username,
                        timestamp: new Date()
                    });

                    console.log(`Reaction saved in room ${roomId}: ${emoji} from ${username}`);
                } else {
                    socket.emit('error', { message: 'Failed to send reaction' });
                }
            } catch (error: any) {
                console.error('Error sending reaction:', error);
                socket.emit('error', { message: error.message || 'Failed to send reaction' });
            }
        });

        // User leaves room
        socket.on('leave-room', (data: { roomId: string; username: string }) => {
            const { roomId, username } = data;

            if (roomState[roomId]) {
                roomState[roomId] = roomState[roomId].filter(
                    user => user.socketId !== socket.id
                );
            };

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