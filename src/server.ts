import dotenv from "dotenv";
import { Server }from 'socket.io';
import { app } from './app.js';

dotenv.config();

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`WebSocket server running on port ${port} 🔥🔥`);
});

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on('connection', (socket) => {
    console.log('A client is connected!');
    console.log("Socket Id :", socket.id);

    // Send a message
    socket.emit("welcome", "Welcome to Chatter-Box!");

    // Listen for messages
    socket.on("message", (data) => {
        console.log("Client says :", data);

        // Reply back
        socket.emit("reply", `Server recieved: ${data}`);
    });

    // Disconnect event
    socket.on('disconnect', (reason) => {
        console.log("A client is disconnected!");
        console.log("Reason :", reason);
    })
});