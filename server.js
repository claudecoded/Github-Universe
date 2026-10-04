const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

// Active tracking memory for connected developers
const activeDevelopers = {};

io.on('connection', (socket) => {
  // Generates a unique 4-digit corporate dev tag identifier
  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const developerTag = `Dev_${uniqueId}`;

  // Assigns initial state to the joining cursor pointer
  activeDevelopers[socket.id] = {
    id: socket.id,
    devTag: developerTag,
    position: { x: 0, y: 1, z: 0 }, // Spawns above the default center node
    color: getRandomPastelColor(),
    activeWorld: "Lobby"
  };

  console.log(`[NETWORK] Developer registered: ${developerTag} (${socket.id})`);

  // Sends the local client its own developer registration metadata
  socket.emit('local_registration_success', activeDevelopers[socket.id]);

  // Synchronizes the existing active cluster maps state into the new client
  socket.emit('sync_entire_developer_pool', Object.values(activeDevelopers));

  // Broadcasts to all online clients that a new cursor entered the plane
  socket.broadcast.emit('new_developer_joined', activeDevelopers[socket.id]);

  // Synchronizes real-time coordinates movements across the active viewport pipeline
  socket.on('update_cursor_transform', (transformData) => {
    if (activeDevelopers[socket.id]) {
      activeDevelopers[socket.id].position = transformData.position;
      // Dispatches raw transform arrays back to the rendering layer smoothly
      socket.broadcast.emit('peer_cursor_transformed', {
        id: socket.id,
        position: transformData.position
      });
    }
  });

  // Event handler for instance state swapping updates
  socket.on('user_changed_world_instance', (worldThemeName) => {
    if (activeDevelopers[socket.id]) {
      activeDevelopers[socket.id].activeWorld = worldThemeName;
      socket.broadcast.emit('peer_changed_instance_room', {
        id: socket.id,
        activeWorld: worldThemeName
      });
    }
  });

  // Clean-up sequence triggers when a laptop connection closes
  socket.on('disconnect', () => {
    if (activeDevelopers[socket.id]) {
      console.log(`[NETWORK] Developer disconnected: ${activeDevelopers[socket.id].devTag}`);
      delete activeDevelopers[socket.id];
      io.emit('developer_left_network', socket.id);
    }
  });
});

// Utility function creating visual styling standards for distinct arrow meshes
function getRandomPastelColor() {
  const pastelColors = ['#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea', '#ff9aa2', '#a8e6cf'];
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`[ENGINE ACTIVE] GitVerse cluster rendering successfully deployed on: http://localhost:${PORT}`);
});
// Local memory registers caching active connected network nodes
let localDeveloperData = null;
const remoteMeshPointers = {};

// Initialized global socket object instance link mapping
const socket = io();

/**
 * Procedurally generates a clean 3D arrow pointer mesh mimicking mouse cursor geometries.
 * Uses lightweight low-poly structures ensuring fluid frame-rates on standard laptops.
 * 
 * @param {string} hexagonalColor - The specific pastel hex identification code string.
 * @returns {THREE.Group} A consolidated Three.js compound group containing the cursor mesh layers.
 */
function create3DMousePointerMesh(hexagonalColor) {
  const pointerGroup = new THREE.Group();
  const meshMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hexagonalColor),
    roughness: 0.3,
    metalness: 0.1
  });

  // Geometry layer 1: The sharp arrowhead tip triangle cone
  const coneGeometry = new THREE.ConeGeometry(0.4, 1.2, 4);
  const tipConeMesh = new THREE.Mesh(coneGeometry, meshMaterial);
  tipConeMesh.rotation.z = -Math.PI / 4; // Angles the cone into standard click orientation
  tipConeMesh.position.set(-0.2, 0.5, 0);
  pointerGroup.add(tipConeMesh);

  // Geometry layer 2: The base handle structure block rectangle extrusion
  const tailGeometry = new THREE.BoxGeometry(0.18, 0.8, 0.18);
  const handleMesh = new THREE.Mesh(tailGeometry, meshMaterial);
  handleMesh.rotation.z = -Math.PI / 4;
  handleMesh.position.set(-0.5, 0.1, 0);
  pointerGroup.add(handleMesh);

  // Enables computing shadow maps arrays over laptop integrated graphics cards 
  pointerGroup.traverse((nodeElement) => {
    if (nodeElement.isMesh) {
      nodeElement.castShadow = true;
      nodeElement.receiveShadow = true;
    }
  });

  return pointerGroup;
}

/**
 * Creates visual text tags mapping directly above the 3D meshes elements.
 * Generates plain DOM overlays attached seamlessly onto the screen tracking boundaries.
 */
function createDeveloperHTMLOverlayTag(devTag, pastelColor) {
  const overlayNode = document.createElement('div');
  overlayNode.className = 'dev-floating-tag';
  overlayNode.innerText = devTag;
  overlayNode.style.position = 'absolute';
  overlayNode.style.padding = '3px 8px';
  overlayNode.style.background = 'rgba(20, 20, 25, 0.85)';
  overlayNode.style.border = `1px solid ${pastelColor}`;
  overlayNode.style.color = '#ffffff';
  overlayNode.style.fontFamily = '"Courier New", monospace';
  overlayNode.style.fontSize = '11px';
  overlayNode.style.fontWeight = 'bold';
  overlayNode.style.borderRadius = '3px';
  overlayNode.style.pointerEvents = 'none';
  overlayNode.style.transform = 'translate(-50%, -140%)'; // Positions text cleanly over mesh
  
  document.getElementById('ui-overlay-container').appendChild(overlayNode);
  return overlayNode;
}

// ============================================================================
// NETWORK CONTROLLERS & SOCKET SYNCHRONIZATION PIPELINES
// ============================================================================

socket.on('local_registration_success', (assignedIdentity) => {
  localDeveloperData = assignedIdentity;
  console.log(`[CORE] Connected to multiverso as local node: ${localDeveloperData.devTag}`);
});

socket.on('sync_entire_developer_pool', (networkClusterArray) => {
  networkClusterArray.forEach((remoteDev) => {
    // Skips deploying duplication checks on current client profile loop
    if (localDeveloperData && remoteDev.id === localDeveloperData.id) return;
    instantiateNetworkPeerCursor(remoteDev);
  });
});

socket.on('new_developer_joined', (incomingPeerData) => {
  console.log(`[CORE] Developer network pointer entry detected: ${incomingPeerData.devTag}`);
  instantiateNetworkPeerCursor(incomingPeerData);
});

socket.on('peer_cursor_transformed', (transformUpdate) => {
  const peerRecord = remoteMeshPointers[transformUpdate.id];
  if (peerRecord) {
    // Updates coordinates seamlessly targeting processing layers
    peerRecord.mesh.position.set(
      transformUpdate.position.x,
      transformUpdate.position.y,
      transformUpdate.position.z
    );
    updateTagScreenProjection(peerRecord);
  }
});

socket.on('developer_left_network', (disconnectedPeerId) => {
  const targetRecord = remoteMeshPointers[disconnectedPeerId];
  if (targetRecord) {
    scene.remove(targetRecord.mesh);
    targetRecord.domElement.remove();
    delete remoteMeshPointers[disconnectedPeerId];
    console.log(`[CORE] Removed developer pointer instance: ${disconnectedPeerId}`);
  }
});

function instantiateNetworkPeerCursor(peerData) {
  if (remoteMeshPointers[peerData.id]) return;

  const threeMeshInstance = create3DMousePointerMesh(peerData.color);
  threeMeshInstance.position.set(peerData.position.x, peerData.position.y, peerData.position.z);
  scene.add(threeMeshInstance);

  const domTagOverlay = createDeveloperHTMLOverlayTag(peerData.devTag, peerData.color);

  remoteMeshPointers[peerData.id] = {
    mesh: threeMeshInstance,
    domElement: domTagOverlay,
    metadata: peerData
  };
}

/**
 * Projects 3D spatial vectors directly into 2D viewport coordinates.
 * Keeps the floating developer tags fixed precisely on top of the moving cursors.
 */
function updateTagScreenProjection(peerRecord) {
  if (!camera) return;
  
  const spatialVector = new THREE.Vector3();
  peerRecord.mesh.getWorldPosition(spatialVector);
  spatialVector.project(camera);

  // Computes pixel layout properties matches based on monitor boundaries thresholds
  const screenCoordinateX = (spatialVector.x *  .5 + .5) * window.innerWidth;
  const screenCoordinateY = (spatialVector.y * -.5 + .5) * window.innerHeight;

  peerRecord.domElement.style.left = `${screenCoordinateX}px`;
  peerRecord.domElement.style.top = `${screenCoordinateY}px`;
}

/**
 * Core broadcast loop hook executed into your principal animation runtime script sequence.
 * Tracks local user movement parameters across the plane maps surface.
 * 
 * @param {THREE.Vector3} activePositionVector - Current position coordinate of local mouse raycast hit.
 */
function broadcastLocalTransformUpdate(activePositionVector) {
  if (socket && socket.connected && localDeveloperData) {
    socket.emit('update_cursor_transform', {
      position: {
        x: activePositionVector.x,
        y: activePositionVector.y + 0.1, // Floating padding offsets constant adjustments
        z: activePositionVector.z
      }
    });
  }
}
