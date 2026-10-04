const express = require('express');
const app = express();
const path = require('path'); // Core module to handle absolute system directory paths smoothly
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

// Serves all static layout assets (main.js, maps JSON directories) nested inside public folder
app.use(express.static('public'));

// Secure fallback route mapping the landing URL specifically to the index.html on the root layer
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Active tracking memory for connected developers network clients
const activeDevelopers = {};

// This manages every developer that connects to your multiverse environment cluster
io.on('connection', (socket) => {
  // Generates a unique 4-digit corporate dev tag identifier
  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const developerTag = `Dev_${uniqueId}`;

  // Assigns initial state parameters to the joining tridimensional cursor mesh pointer
  activeDevelopers[socket.id] = {
    id: socket.id,
    devTag: developerTag,
    position: { x: 0, y: 1, z: 0 }, 
    color: getRandomPastelColor(),
    activeWorld: "Lobby"
  };

  console.log(`[NETWORK] Developer registered: ${developerTag} (${socket.id})`);

  // Sends the local client its own developer registration metadata attributes
  socket.emit('local_registration_success', activeDevelopers[socket.id]);

  // Synchronizes the existing active cluster maps state profiles into the new client pipeline
  socket.emit('sync_entire_developer_pool', Object.values(activeDevelopers));

  // Broadcasts to all online clients that a new cursor entered the rendering plane view
  socket.broadcast.emit('new_developer_joined', activeDevelopers[socket.id]);

  // Synchronizes real-time coordinates transform movements updates across the matrix
  socket.on('update_cursor_transform', (transformData) => {
    if (activeDevelopers[socket.id]) {
      activeDevelopers[socket.id].position = transformData.position;
      socket.broadcast.emit('peer_cursor_transformed', {
        id: socket.id,
        position: transformData.position
      });
    }
  });

  // Listener to catch when a user alters their private room instance using chat commands triggers
  socket.on('user_changed_world_instance', (worldThemeName) => {
    if (activeDevelopers[socket.id]) {
      activeDevelopers[socket.id].activeWorld = worldThemeName;
      socket.broadcast.emit('peer_changed_instance_room', {
        id: socket.id,
        activeWorld: worldThemeName
      });
    }
  });

  // Clean-up memory garbage collection sequence triggers when a laptop connection drops down
  socket.on('disconnect', () => {
    if (activeDevelopers[socket.id]) {
      console.log(`[NETWORK] Developer disconnected: ${activeDevelopers[socket.id].devTag}`);
      delete activeDevelopers[socket.id];
      io.emit('developer_left_network', socket.id);
    }
  });
});

// Utility function creating visual styling standards for distinct arrow meshes profiles
function getRandomPastelColor() {
  const pastelColors = ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea', '#ff9aa2', '#a8e6cf'];
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`[ENGINE ACTIVE] GitVerse cluster rendering successfully deployed on: http://localhost:${PORT}`);
});
