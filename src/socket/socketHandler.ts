import { Server, Socket } from 'socket.io';
import { prisma } from '../config/prisma.js';

const socketUsers = new Map<string, { username: string, roomId: string, roomName: string }>();
const roomUsers = new Map<string, Set<string>>();

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.emit('welcome', 'Welcome to Chatter-Box!');

        // User creates a room
        socket.on('create-room', async(data: { name: string }) => {
            const { name } = data;

            if(!name) {
                return socket.emit('room-error', {
                    satus: 'fail',
                    message: "Please provide a room name!",
                });
            };

            const room = await prisma.room.create({
                data: {
                    name: name,
                }
            });

            socket.emit('room-created', {
                message: "Room created succesfully",
                ...room
            });
        });

        // User joins a room
        socket.on('join-room', async(data: { roomName: string; username: string }) => {
            const { roomName, username } = data;

            if(!roomName || !username) {
                return socket.emit('join-error', {
                    satus: 'fail',
                    message: "Please provide a room name and username!",
                });
            };
            socket.join(roomName);
            
            const userRoom = await prisma.room.findUnique({
                where: {
                    name: roomName
                },
                select: {
                    id: true,
                    name: true,
                }
            });

            if(!userRoom) {
                return socket.emit('room-error', {
                    satus: 'fail',
                    message: "Room does not exst!",
                });
            }
            socketUsers.set(socket.id, { username, roomId: userRoom.id, roomName: userRoom.name })
            if(!roomUsers.has(roomName)) {
                roomUsers.set(roomName, new Set());
            };
            roomUsers.get(roomName)!.add(username);

            console.log(`${username} joined room ${roomName}`);

            io.to(roomName).emit('user-joined', {
                username,
                activeUsers: `${roomUsers.get(roomName)!.size} active users!`,
                message: `${username} joined the room!`
            });
        });

        // Send message to room
        socket.on('send-message', async (data: { roomId: string; username: string; text: string }) => {
                const { roomId, username , text } = data;

                if(!roomId || !text) {
                    return socket.emit('message-error', {
                        satus: 'fail',
                        message: "Please provide a room Id and message!",
                    });
                };

                const message = await prisma.message.create({
                    data: {
                        roomId: roomId,
                        text: text,
                    },
                    select: {
                        room: true,
                    }
                });

                io.to(message.room.name).emit('receive-message', {
                    status: username,
                    message: text,
                    timeStamp: new Date()
                });
        });

        // Send reaction to room - CALLS CONTROLLER FUNCTION
        socket.on('send-reaction', (data: { roomName: string; emoji: string; username: string }) => {
                const { roomName, emoji, username } = data;

                if(!roomName || !emoji || !username) {
                    return socket.emit('reaction-error', {
                        satus: 'fail',
                        message: "Please provide a room name, reaction and username!",
                    });
                };
                
                // Broadcast reaction to all clients in room
                io.to(roomName).emit('receive-reaction', {
                    username: username,
                    emoji: emoji,
                    timestamp: new Date(),
                });
        });

        // User leaves room
        socket.on('leave-room', async(data: { roomName: string; username: string }) => {
            const { roomName, username } = data;

            if(!roomName || !username) {
                return socket.emit('reaction-error', {
                    satus: 'fail',
                    message: "Please provide a room name and username!",
                });
            };

            if(roomUsers.has(roomName)) {
                roomUsers.get(roomName)!.delete(username);
            };

            socket.leave(roomName);
            socketUsers.delete(socket.id);

            const activeUsersCount =roomUsers.get(roomName)!.size;

            if(activeUsersCount === 0) {
                roomUsers.delete(roomName)
                await prisma.room.delete({
                    where: {
                        name: roomName,
                    }
                });
            };

            io.to(roomName).emit('user-left', {
                username,
                activeUsers: activeUsersCount,
                message: `${username} left the room`
            });
        });

        // Disconnect
        socket.on('disconnect', async() => {
                const user = socketUsers.get(socket.id);
                if (!user) return;

                const { username , roomId, roomName } = user;
                const room = roomUsers.get(roomId);

                if(room) {
                    roomUsers.delete(username);
                };

                const activeUsersCount =roomUsers.get(roomName)!.size;
                if(activeUsersCount === 0) {
                    roomUsers.delete(roomName)
                    await prisma.room.delete({
                        where: {
                            name: roomName,
                        }
                    });
                };

                io.to(roomName).emit('user-left', {
                    username,
                    activeUsers: activeUsersCount,
                    message: `${username} left the room`
                });
        });
    });
};