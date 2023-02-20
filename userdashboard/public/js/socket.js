console.log("client socket.js loaded");

const socket = io();

socket.on('notification', (data) => {
    console.log(`New notification: ${data}`);
})