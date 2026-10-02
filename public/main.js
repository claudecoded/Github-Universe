import * as THREE from 'https://cloudflare.com';

const socket = io();

// 1. Metaverse Viewport Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f8fa); // Clean white/gray canvas background

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable standard shadows for realistic grounding
document.body.appendChild(renderer.domElement);

// Smooth Corporate Studio Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const roomLight = new THREE.DirectionalLight(0xffffff, 0.6);
roomLight.position.set(10, 18, 12);
roomLight.castShadow = true;
roomLight.shadow.mapSize.width = 2048;
roomLight.shadow.mapSize.height = 2048;
scene.add(roomLight);

// Position camera at a comfortable bird-eye meeting angle looking down at the workspace rooms
camera.position.set(0, -6, 9);
camera.lookAt(0, 0, 0);

const remoteCursors = {};
let currentRoomGroup = new THREE.Group();
scene.add(currentRoomGroup);

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const envSelector = document.getElementById('environment-selector');

// 2. Minimalist Low-Poly Room Environments
function buildMetaverseRoom(roomType) {
    while(currentRoomGroup.children.length > 0){ 
        currentRoomGroup.remove(currentRoomGroup.children[0]); 
    }

    // Common Base Floor for all room setups (Solid, soft, opaque matte material)
    const floorGeo = new THREE.PlaneGeometry(30, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe1e4e8, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    currentRoomGroup.add(floor);

    if (roomType === 'lobby-room') {
        // Room 1: Main Meeting Lobby with simple central desk structure meshes
        const centralDeskGeo = new THREE.CylinderGeometry(2, 2, 0.4, 32);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x0366d6, roughness: 0.5 }); // GitHub Corporate Blue
        const centralDesk = new THREE.Mesh(centralDeskGeo, deskMat);
        centralDesk.rotation.x = Math.PI / 2;
        centralDesk.position.set(0, 0, 0.2);
        centralDesk.castShadow = true;
        currentRoomGroup.add(centralDesk);

        // Surrounding discussion pillars
        const pillarGeo = new THREE.BoxGeometry(1, 1, 1.5);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
        for(let i = 0; i  {
    buildMetaverseRoom(state.currentMap);
    envSelector.value = state.currentMap;

    Object.keys(state.devs).forEach((id) => {
        if (id !== socket.id) {
            instantiateRemoteCursor(id, state.devs[id].color, state.devs[id].id);
        }
    });
});

socket.on('developerJoined', (data) => {
    instantiateRemoteCursor(data.id, data.info.color, data.info.id);
});

socket.on('cursorUpdated', (data) => {
    if (remoteCursors[data.id]) {
        remoteCursors[data.id].position.set(data.x, data.y, data.z);
    }
});

socket.on('mapChanged', (roomType) => {
    envSelector.value = roomType;
    buildMetaverseRoom(roomType);
});

socket.on('developerLeft', (id) => {
    if (remoteCursors[id]) {
        scene.remove(remoteCursors[id]);
        delete remoteCursors[id];
    }
});

// 5. Plane Matrix Calculations Input Hooks
window.addEventListener('mousemove', (event) => {
    mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseVector, camera);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersectionPoint);

    socket.emit('cursorMove', {
        x: intersectionPoint.x,
        y: intersectionPoint.y,
        z: intersectionPoint.z
    });
});

envSelector.addEventListener('change', (e) => {
    socket.emit('switchMap', e.target.value);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main Static Framerate Execution Loop
function runEngineLoop() {
    requestAnimationFrame(runEngineLoop);
    renderer.render(scene, camera);
}
runEngineLoop();
