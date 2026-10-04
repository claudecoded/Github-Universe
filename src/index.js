// =========================================================================
// 1. GLOBAL WORKSPACE STATES & MAP RANDOMIZER
// =========================================================================
const mapsList = ["LOBBY-ROOM", "REPOSITORY-HUB", "AGILE-BOARD"];
const selectedMap = mapsList[Math.floor(Math.random() * mapsList.length)];

// Update the overlay text indicator dynamically
const mapIndicator = document.getElementById("map-text");
if (mapIndicator) {
    mapIndicator.innerText = `Active Room Map: ${selectedMap}`;
}

// =========================================================================
// 2. CORE THREE.JS ENGINE VIEWPORT SETUP
// =========================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f8fa); // Standard clean gray metaverse canvas

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Smooth Studio Office Lighting Settings
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Set aerial perspective camera angle looking down at the structural floor
camera.position.set(0, -8, 10);
camera.lookAt(0, 0, 0);

// =========================================================================
// 3. BUILDING META-ROOM GEOMETRIES (LOW-POLY ENVIRONMENTS)
// =========================================================================
// Base Matte Floor Container
const floorGeo = new THREE.PlaneGeometry(35, 25);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe1e4e8, roughness: 0.9 });
const floor = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor);

// Generate Modern Shared Collaborative Meeting Desk
const tableGeo = new THREE.BoxGeometry(4, 2.5, 0.8);
const tableMat = new THREE.MeshStandardMaterial({ color: 0x0366d6, roughness: 0.5 }); // GitHub Corporate Blue
const mainTable = new THREE.Mesh(tableGeo, tableMat);
mainTable.position.set(0, 0, 0.4);
scene.add(mainTable);

// Add an grid overlay pattern across the floor to guide developers pointers
const gridHelper = new THREE.GridHelper(30, 30, 0xd1d5da, 0xe1e4e8);
gridHelper.rotation.x = Math.PI / 2;
gridHelper.position.z = 0.01; // Slightly raised above floor to avoid flickering artifacts
scene.add(gridHelper);

// =========================================================================
// 4. RENDERING FLOATING PEER CURSORS (MULTIPLAYER POSITION SIMULATORS)
// =========================================================================
const cursorGeo = new THREE.CylinderGeometry(0, 0.25, 0.8, 4);
const cursorMat = new THREE.MeshStandardMaterial({ color: 0x2ea44f, roughness: 0.4 }); // GitHub Success Green
const remotePeerCursor = new THREE.Mesh(cursorGeo, cursorMat);
remotePeerCursor.position.set(4, 3, 0.6);
remotePeerCursor.rotation.x = Math.PI / 4; // Tilted pointer posture layout
scene.add(remotePeerCursor);

// =========================================================================
// 5. MOUSE EVENT HANDLERS & RAYCASTING INTERACTION
// =========================================================================
const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Normalize screen pixel inputs to coordinate space bound matrix (-1 to 1)
    mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseVector, camera);
    const clickIntersections = raycaster.intersectObject(mainTable);

    // Toggle the shared HTML Idea Modal Card visibility layout on table collision match
    if (clickIntersections.length > 0) {
        const modalElement = document.getElementById('idea-card');
        if (modalElement) modalElement.style.display = 'block';
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Run continuous render update cycles loops execution frames
function runFrameEngineLoop() {
    requestAnimationFrame(runFrameEngineLoop);
    
    // Subtle idle floating animation dynamics for remote developers pointers
    if (remotePeerCursor) {
        remotePeerCursor.rotation.z += 0.005;
    }
    
    renderer.render(scene, camera);
}
runFrameEngineLoop();
