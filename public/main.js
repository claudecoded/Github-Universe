// ============================================================================
// GLOBAL RENDER ENGINE & NETWORK MEMORY STATE REGISTRIES
// ============================================================================
let scene, camera, renderer;
let localDeveloperData = null;
const remoteMeshPointers = {};

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

// Establish real-time persistent network pipeline connection 
const socket = io();

// Initialize the Three.js viewport context loop environment natively
function initEngine() {
  // Create core layout engine scene structure
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#110f1a');

  // Configure viewport projection camera lens metrics parameters
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 25);
  camera.lookAt(0, 0, 0);

  // Deploy basic lighting rigs optimizations for laptops integrations
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);

  // Setup client renderer component attachment node layers
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Core window resize listener response logic
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Pick and trigger a random map profile build automatically at launch
  const randomInitialMap = availableMaps[Math.floor(Math.random() * availableMaps.length)];
  loadSpecificWorldInstance(randomInitialMap, scene);

  // Launch core graphics loop iteration pipeline execution triggers
  animate();
}

// ============================================================================
// CHAT INTERPRETER & INSTANCE NAVIGATOR CONTROLLERS
// ============================================================================
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
    
    // Purges old structural meshes from the active scene tree safely
    const blocksToRemove = scene.children.filter(child => child.isMesh && child !== camera);
    blocksToRemove.forEach(block => scene.remove(block));
    
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
  console.log(`[CORE] Connected to multiverse as local node: ${localDeveloperData.devTag}`);
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
// ============================================================================
// RUNTIME ENGINE LOOP ANIMATION LOOP
// ============================================================================
function animate() {
requestAnimationFrame(animate);
// Continuously map the 2D floating names over the active 3D pointers meshes
Object.values(remoteMeshPointers).forEach(peerRecord => {
updateTagScreenProjection(peerRecord);
});
renderer.render(scene, camera);
}
// Fire up the entire runtime infrastructure automatically when DOM content mounts
window.onload = initEngine;
