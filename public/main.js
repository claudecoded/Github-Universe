// ============================================================================
// GLOBAL RENDER ENGINE & NETWORK MEMORY STATE REGISTRIES
// ============================================================================
let scene, camera, renderer;
let localDeveloperData = null;
const remoteMeshPointers = {};

// Raycasting interaction management vectors variables
const interactionRaycaster = new THREE.Raycaster();
const mousePointerCoordinate = new THREE.Vector2();
let trackingFloorMesh = null;

// Default available world maps selection catalog list
const availableMaps = [
  'maps/map_decentraland.json',
  'maps/map_sandbox_voxels.json',
  'maps/map_horizon_somnium.json',
  'maps/map_upland_voxels.json',
  'maps/map_gamimall.json',
  'maps/map_apple_house.json',
  'maps/map_world_zen.json'
];

const socket = io();

function initEngine() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#110f1a');

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 18, 22);
  camera.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 25, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Core tracking plane: An invisible floor grid to raycast mouse positions onto
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshBasicMaterial({ visible: false });
  trackingFloorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  trackingFloorMesh.rotation.x = -Math.PI / 2; // Places flat horizontally
  scene.add(trackingFloorMesh);

  // Setup Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMoveTrack);
  setupChatUIListeners();

  // Load random layout at launch state sequence
  const randomInitialMap = availableMaps[Math.floor(Math.random() * availableMaps.length)];
  loadSpecificWorldInstance(randomInitialMap, scene);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Tracks raw mouse moves and converts them to canonical viewport ratios
function onMouseMoveTrack(event) {
  mousePointerCoordinate.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePointerCoordinate.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ============================================================================
// CHAT INTERPRETER HUD EVENT BINDINGS
// ============================================================================
function setupChatUIListeners() {
  const inputElement = document.getElementById('chat-input-field');
  if (!inputElement) return;

  inputElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const chatBufferText = inputElement.value.trim();
      if (chatBufferText.length > 0) {
        if (chatBufferText.startsWith('/world ')) {
          interpretChatCommand(chatBufferText, scene);
        } else {
          console.log(`[CHAT LOG] Local user says: ${chatBufferText}`);
          // Future hooks implementation: dispatch string tokens to Socket pipelines here
        }
        inputElement.value = ''; // Flushes field buffer
      }
    }
  });
}

function interpretChatCommand(inputBuffer, scene) {
  if (inputBuffer.startsWith('/world ')) {
    const targetWorld = inputBuffer.replace('/world ', '').trim().toLowerCase();
    let targetMapPath = '';

    switch(targetWorld) {
      case 'sandbox': targetMapPath = 'maps/map_sandbox_voxels.json'; break;
      case 'social': targetMapPath = 'maps/map_horizon_somnium.json'; break;
      case 'gallery': targetMapPath = 'maps/map_upland_voxels.json'; break;
      case 'mall': targetMapPath = 'maps/map_gamimall.json'; break;
      case 'apple': targetMapPath = 'maps/map_apple_house.json'; break;
      case 'zen': targetMapPath = 'maps/map_world_zen.json'; break;
      default:
        console.warn(`World cluster target "${targetWorld}" not registered in GitVerse core.`);
        return;
    }

    console.log(`Redirecting networking layers to standalone private instance: ${targetWorld}`);
    
    // Purges old static structural meshes from the scene architecture safety locks
    const meshesToRemove = scene.children.filter(child => child.isMesh && child !== camera && child !== trackingFloorMesh);
    meshesToRemove.forEach(mesh => scene.remove(mesh));
    
    loadSpecificWorldInstance(targetMapPath, scene);
  }
}

async function loadSpecificWorldInstance(mapFilePath, scene) {
  try {
    const networkResponse = await fetch(mapFilePath);
    const mapConfigData = await networkResponse.json();
    
    document.title = `GitVerse - ${mapConfigData.themeName}`;
    scene.background = new THREE.Color(mapConfigData.backgroundColor);

    mapConfigData.blocks.forEach(blockData => {
      let sizeX = Array.isArray(blockData.scale) ? blockData.scale[0] : blockData.scale;
      let sizeY = Array.isArray(blockData.scale) ? blockData.scale[1] : blockData.scale;
      let sizeZ = Array.isArray(blockData.scale) ? blockData.scale[2] : blockData.scale;
      
      let coordinateX = Array.isArray(blockData.position) ? blockData.position[0] : blockData.position;
      let coordinateY = Array.isArray(blockData.position) ? blockData.position[1] : blockData.position;
      let coordinateZ = Array.isArray(blockData.position) ? blockData.position[2] : blockData.position;

      const blockGeometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
      const blockMaterial = new THREE.MeshStandardMaterial({ 
        color: blockData.color, 
        roughness: 0.5,
        metalness: 0.1
      });
      
      const staticMesh = new THREE.Mesh(blockGeometry, blockMaterial);
      staticMesh.position.set(coordinateX, coordinateY, coordinateZ);
      staticMesh.castShadow = true;
      staticMesh.receiveShadow = true;
      
      if (blockData.label) { 
        staticMesh.userData = { label: blockData.label }; 
      }
      scene.add(staticMesh);
    });

    if (typeof socket !== 'undefined') {
      socket.emit('user_changed_world_instance', mapConfigData.themeName);
    }
    
  } catch (runtimeError) {
    console.error("Critical rendering failure processing selected world instance geometry:", runtimeError);
  }
}

// ============================================================================
// REAL-TIME 3D CURSOR MULTIPLAYER GEOMETRIES MAPPING
// ============================================================================
function create3DMousePointerMesh(hexagonalColor) {
  const pointerGroup = new THREE.Group();
  const meshMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hexagonalColor),
    roughness: 0.3,
    metalness: 0.1
  });

  const coneGeometry = new THREE.ConeGeometry(0.4, 1.2, 4);
  const tipConeMesh = new THREE.Mesh(coneGeometry, meshMaterial);
  tipConeMesh.rotation.z = -Math.PI / 4;
  tipConeMesh.position.set(-0.2, 0.5, 0);
  pointerGroup.add(tipConeMesh);

  const tailGeometry = new THREE.BoxGeometry(0.18, 0.8, 0.18);
  const handleMesh = new THREE.Mesh(tailGeometry, meshMaterial);
  handleMesh.rotation.z = -Math.PI / 4;
  handleMesh.position.set(-0.5, 0.1, 0);
  pointerGroup.add(handleMesh);

  pointerGroup.traverse((nodeElement) => {
    if (nodeElement.isMesh) {
      nodeElement.castShadow = true;
      nodeElement.receiveShadow = true;
    }
  });

  return pointerGroup;
}

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
  overlayNode.style.transform = 'translate(-50%, -140%)'; 
  
  document.getElementById('ui-overlay-container').appendChild(overlayNode);
  return overlayNode;
}

function updateTagScreenProjection(peerRecord) {
  if (!camera) return;
  
  const spatialVector = new THREE.Vector3();
  peerRecord.mesh.getWorldPosition(spatialVector);
  spatialVector.project(camera);

  const screenCoordinateX = (spatialVector.x * 0.5 + 0.5) * window.innerWidth;
  const screenCoordinateY = (spatialVector.y * -0.5 + 0.5) * window.innerHeight;

  peerRecord.domElement.style.left = `${screenCoordinateX}px`;
  peerRecord.domElement.style.top = `${screenCoordinateY}px`;
}

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

// ============================================================================
// NETWORK LAYER LISTENERS COUPLING
// ============================================================================
socket.on('local_registration_success', (assignedIdentity) => {
localDeveloperData = assignedIdentity;
console.log([CORE] Connected to multiverse as local node: ${localDeveloperData.devTag});
});
socket.on('sync_entire_developer_pool', (networkClusterArray) => {
networkClusterArray.forEach((remoteDev) => {
if (localDeveloperData && remoteDev.id === localDeveloperData.id) return;
instantiateNetworkPeerCursor(remoteDev);
});
});
socket.on('new_developer_joined', (incomingPeerData) => {
instantiateNetworkPeerCursor(incomingPeerData);
});
socket.on('peer_cursor_transformed', (transformUpdate) => {
const peerRecord = remoteMeshPointers[transformUpdate.id];
if (peerRecord) {
peerRecord.mesh.position.set(transformUpdate.position.x, transformUpdate.position.y, transformUpdate.position.z);
updateTagScreenProjection(peerRecord);
}
});
socket.on('developer_left_network', (disconnectedPeerId) => {
const targetRecord = remoteMeshPointers[disconnectedPeerId];
if (targetRecord) {
scene.remove(targetRecord.mesh);
targetRecord.domElement.remove();
delete remoteMeshPointers[disconnectedPeerId];
}
});
function broadcastLocalTransformUpdate(activePositionVector) {
if (socket && socket.connected && localDeveloperData) {
socket.emit('update_cursor_transform', {
position: {
x: activePositionVector.x,
y: activePositionVector.y + 0.1,
z: activePositionVector.z
}
});
}
}
// ============================================================================
// RUNTIME ENGINE LOOP ANIMATION LOOP
// ============================================================================
function animate() {
requestAnimationFrame(animate);
// RAYCASTING EXECUTION MECHANICS: Casts ray from 2D screen coordinate onto 3D grid surface
if (trackingFloorMesh && camera) {
interactionRaycaster.setFromCamera(mousePointerCoordinate, camera);
const planeIntersections = interactionRaycaster.intersectObject(trackingFloorMesh);
if (planeIntersections.length > 0) {
const collisionPoint = planeIntersections[0].point;
// Broadcasts local coordinates transforms back over the real-time servers pipelines
broadcastLocalTransformUpdate(collisionPoint);
}
}
// Continuously map the 2D floating names over the active 3D pointers meshes
Object.values(remoteMeshPointers).forEach(peerRecord => {
updateTagScreenProjection(peerRecord);
});
renderer.render(scene, camera);
}
window.onload = initEngine;
