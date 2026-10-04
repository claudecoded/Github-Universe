/**
 * Interprets chat input commands typed by the developer.
 * Supports the '/world <map_name>' command to hot-swap server instances.
 * 
 * @param {string} inputBuffer - The raw text string from the chat input dashboard.
 * @param {THREE.Scene} scene - The active Three.js rendering stage.
 */
function interpretChatCommand(inputBuffer, scene) {
  // Verifies if the clean string starts with the private server command syntax
  if (inputBuffer.startsWith('/world ')) {
    const targetWorld = inputBuffer.replace('/world ', '').trim().toLowerCase();
    let targetMapPath = '';

    // Map configuration registry matching text commands to public JSON files
    switch(targetWorld) {
      case 'sandbox':
        targetMapPath = 'maps/map_sandbox_voxels.json';
        break;
      case 'social':
        targetMapPath = 'maps/map_horizon_somnium.json';
        break;
      case 'gallery':
        targetMapPath = 'maps/map_upland_voxels.json';
        break;
      case 'mall':
        targetMapPath = 'maps/map_gamimall.json';
        break;
      case 'apple':
        targetMapPath = 'maps/map_apple_house.json';
        break;
      case 'zen':
        targetMapPath = 'maps/map_world_zen.json';
        break;
      default:
        console.warn(`World cluster target "${targetWorld}" not registered in GitVerse core.`);
        return;
    }

    console.log(`Redirecting networking layers to standalone private instance: ${targetWorld}`);
    
    // Purges old structural meshes from the active scene tree before hot-reloading
    while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
    }
    
    // Executes the asynchronous runtime deployment of the selected map layout
    loadSpecificWorldInstance(targetMapPath, scene);
  }
}

/**
 * Fetches and builds a designated world structure from its JSON matrix definition.
 * 
 * @param {string} mapFilePath - The direct internal network URI path to the JSON asset.
 * @param {THREE.Scene} scene - The active Three.js rendering stage.
 */
async function loadSpecificWorldInstance(mapFilePath, scene) {
  try {
    const networkResponse = await fetch(mapFilePath);
    const mapConfigData = await networkResponse.json();
    
    // Direct UI binding and layout configurations
    document.title = `GitVerse - ${mapConfigData.themeName}`;
    scene.background = new THREE.Color(mapConfigData.backgroundColor);

    // Iterates across the asset array compiling low-poly elements into rendering loops
    mapConfigData.blocks.forEach(blockData => {
      // Dimensions safety fallback parameters (Scales X, Y, Z coordinates handling)
      let sizeX = Array.isArray(blockData.scale) ? blockData.scale[0] : blockData.scale;
      let sizeY = Array.isArray(blockData.scale) ? blockData.scale[1] : blockData.scale;
      let sizeZ = Array.isArray(blockData.scale) ? blockData.scale[2] : blockData.scale;
      
      // Coordinates positioning layout vectors
      let coordinateX = Array.isArray(blockData.position) ? blockData.position[0] : blockData.position;
      let coordinateY = Array.isArray(blockData.position) ? blockData.position[1] : blockData.position;
      let coordinateZ = Array.isArray(blockData.position) ? blockData.position[2] : blockData.position;

      // Generates mathematical boundaries and production-ready materials mesh sets
      const blockGeometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
      const blockMaterial = new THREE.MeshStandardMaterial({ 
        color: blockData.color, 
        roughness: 0.5,
        metalness: 0.1
      });
      
      const staticMesh = new THREE.Mesh(blockGeometry, blockMaterial);
      staticMesh.position.set(coordinateX, coordinateY, coordinateZ);
      
      // Configures real-time raycasting shadows optimizations for laptops integrations
      staticMesh.castShadow = true;
      staticMesh.receiveShadow = true;
      
      // Stores internal metadata parameters on user interactions attributes
      if (blockData.label) { 
        staticMesh.userData = { label: blockData.label }; 
      }
      
      scene.add(staticMesh);
    });

    // Synchronizes tracking indices updates natively through the Socket.io hub network
    if (typeof socket !== 'undefined') {
      socket.emit('user_changed_world_instance', mapConfigData.themeName);
    }
    
  } catch (runtimeError) {
    console.error("Critical rendering failure processing selected world instance geometry:", runtimeError);
  }
}
