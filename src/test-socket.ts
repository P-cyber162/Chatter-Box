import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected:', socket.id);

    // Join room
    socket.emit('join-room', {
        roomId: 'room-123',
        userId: 'user-456',
        username: 'john'
    });

    // Listen for join event
    socket.on('user-joined', (data) => {
        console.log('User joined:', data);
    });

    // Send a message
    socket.emit('send-message', {
        roomId: 'room-123',
        userId: 'user-456',
        text: 'Hello via WebSocket!',
        username: 'john'
    });

    // Receive messages
    socket.on('receive-message', (data) => {
        console.log('Message received:', data);
    });

    // Send reaction
    socket.emit('send-reaction', {
        roomId: 'room-123',
        messageId: 'msg-789',
        emoji: 'HAPPY',
        username: 'john'
    });

    // Receive reactions
    socket.on('receive-reaction', (data) => {
        console.log('Reaction:', data);
    });

    // Listen for errors
    socket.on('error', (data) => {
        console.error('Socket error:', data);
    });
});