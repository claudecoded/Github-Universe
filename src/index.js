// Global rendering engine setup for GitHub Multiverse room layout
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f8fa);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

camera.position.set(0, -8, 10);
camera.lookAt(0, 0, 0);

// Random map system selection simulation
const mapsList = ["LOBBY-ROOM", "REPOSITORY-HUB", "AGILE-BOARD"];
const selectedMap = mapsList[Math.floor(Math.random() * mapsList.length)];
document.getElementById("map-text").innerText = `Active Room Map: ${selectedMap}`;

// Building low-poly room environment base
const floorGeo = new THREE.PlaneGeometry(35, 25);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xe1e4e8, roughness: 0.9 });
const floor = new THREE.Mesh(floorGeo, floorMat);
scene.add(floor);

// Generate modern workspace table meshes shapes items
const tableGeo = new THREE.BoxGeometry(2.5, 1.8, 0.75);
const tableMat = new THREE.MeshStandardMaterial({ color: 0x0366d6 });
const table1 = new THREE.Mesh(tableGeo, tableMat);
table1.position.set(0, 0, 0.375);
scene.add(table1);

// Alternate active peer cursor tracking simulator rendering shapes meshes
const cursorGeo = new THREE.CylinderGeometry(0, 0.2, 0.6, 4);
const cursorMat = new THREE.MeshStandardMaterial({ color: 0x2ea44f });
const mockCursor = new THREE.Mesh(cursorGeo, cursorMat);
mockCursor.position.set(3, 2, 0.5);
mockCursor.rotation.x = Math.PI / 4;
scene.add(mockCursor);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
