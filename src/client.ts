import { io } from 'socket.io-client';

const socket = io(`http://localhost:${process.env.PORT}`);

socket.on("connect", () => {
    console.log('Connected to the server');
    console.log("My socket id :", socket.id);

    //Send message
    socket.emit('message', 'Hello from the client');

    // Welcome event
    socket.on('welcome', (msg) => {
        console.log("WELCOME :", msg);
    });

    // Reply event
    socket.on('reply', (msg) => {
        console.log("REPLY :", msg);
    });

    //Disconnect
    socket.on('disconnect', (reason) => {
        console.log("Disconnected!");
        console.log("Reason :", reason);
    });
});