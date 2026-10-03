// =========================================================================
// 1. GLOBAL MULTIVERSE STATES & UI LOGIC
// =========================================================================
const mapsList = ["LOBBY-ROOM", "REPOSITORY-HUB", "AGILE-BOARD"];
const selectedMap = mapsList[Math.floor(Math.random() * mapsList.length)];

// Update the HUD subtitle with the randomly allocated map title
document.getElementById("map-text").innerText = `Active Room Map: ${selectedMap}`;

// =========================================================================
// 2. CORE THREE.JS GRAPHICS ENGINE SETUP
// =========================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f8fa); // Clean low-poly corporate gray canvas

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Smooth Studio Office Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Isometric aerial camera position looking down at the structural floor
camera.position.set(0, -8, 10);
camera.lookAt(0, 0, 0);

// =========================================================================
// 3. GENERATING ENVIRONMENT ROOM OBJECTS
// =========================================================================
// Base Matte Floor Mesh Structure
const floorGeo = new THREE.PlaneGeometry(35, 25);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe1e4e8, roughness: 0.9 });
const floor = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor);

// Generate Modern Shared Collaboration Table
const tableGeo = new THREE.BoxGeometry(4, 2.5, 0.8);
const tableMat = new THREE.MeshStandardMaterial({ color: 0x0366d6, roughness: 0.5 }); // GitHub Corporate Blue
const mainTable = new THREE.Mesh(tableGeo, tableMat);
mainTable.position.set(0, 0, 0.4);
scene.add(mainTable);

// =========================================================================
// 4. RENDERING FLOATING PEER CURSORS (MOCK MULTIPLAYER SIMULATION)
// =========================================================================
// Create 3D mouse pointer cones to represent online developers
const cursorGeo = new THREE.CylinderGeometry(0, 0.25, 0.8, 4);
const cursorMat = new THREE.MeshStandardMaterial({ color: 0x2ea44f, roughness: 0.4 }); // GitHub Green
const activePeerCursor = new THREE.Mesh(cursorGeo, cursorMat);
activePeerCursor.position.set(4, 3, 0.6);
activePeerCursor.rotation.x = Math.PI / 4; // Tilted cursor pointer angle
scene.add(activePeerCursor);

// =========================================================================
// 5. INTERACTION LOGIC (RAYCASTING MOUSE CLICKS)
// =========================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Normalize mouse screen position coordinates matrix (-1 to 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mainTable);

    // If the developer clicks the modern table mesh object, display the Idea Card Popup
    if (intersects.length > 0) {
        document.getElementById('idea-card').style.display = 'block';
    }
});

// Window resizing dynamics handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render viewport animation execution frames loop
function animate() {
    requestAnimationFrame(animate);
    
    // Subtle float animation rotation tracking for peer cursors indicators items
    activePeerCursor.rotation.z += 0.005;
    
    renderer.render(scene, camera);
}
animate();
