const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let connectedDevs = {};
let currentActiveMap = 'lobby-room';

io.on('connection', (socket) => {
    console.log(`Developer connected: ${socket.id}`);

    // Standard soft pastel tones matching a clean metaverse theme
    const colors = ['#0366d6', '#28a745', '#ea4aaa', '#ffd33d', '#f66a0a', '#6f42c1'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    connectedDevs[socket.id] = {
        x: 0,
        y: 0,
        z: 0,
        color: randomColor,
        id: socket.id.substring(0, 5),
        message: ''
    };

    socket.emit('initWorkspaceState', {
        devs: connectedDevs,
        currentMap: currentActiveMap
    });

    socket.broadcast.emit('developerJoined', {
        id: socket.id,
        info: connectedDevs[socket.id]
    });

    socket.on('cursorMove', (coords) => {
        if (connectedDevs[socket.id]) {
            connectedDevs[socket.id].x = coords.x;
            connectedDevs[socket.id].y = coords.y;
            connectedDevs[socket.id].z = coords.z;

            socket.broadcast.emit('cursorUpdated', {
                id: socket.id,
                x: coords.x,
                y: coords.y,
                z: coords.z
            });
        }
    });

    socket.on('sendMessage', (msg) => {
        if (connectedDevs[socket.id]) {
            connectedDevs[socket.id].message = msg;
            io.emit('messageReceived', {
                id: socket.id,
                message: msg
            });
        }
    });

    socket.on('switchMap', (selectedMap) => {
        currentActiveMap = selectedMap;
        io.emit('mapChanged', currentActiveMap);
    });

    socket.on('disconnect', () => {
        console.log(`Developer disconnected: ${socket.id}`);
        delete connectedDevs[socket.id];
        io.emit('developerLeft', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`GitVerse Metaverse server running on http://localhost:${PORT}`);
});
