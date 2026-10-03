import * as THREE from 'three';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, onDisconnect, update } from 'firebase/database';

// 1. Public Free Testing Firebase Configuration (Serverless Sync)
const firebaseConfig = {
    databaseURL: "https://firebaseio.com"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Generate a random session ID for this user session
const myUserId = 'user_' + Math.floor(Math.random() * 100000);
const myUserRef = ref(db, `devs/${myUserId}`);
const roomRef = ref(db, 'currentMap');

const colors = ['#0366d6', '#28a745', '#ea4aaa', '#ffd33d', '#f66a0a', '#6f42c1'];
const myColor = colors[Math.floor(Math.random() * colors.length)];
const shortId = myUserId.substring(5);

// Set initial player data and clean up on disconnect automatically
set(myUserRef, { x: 0, y: 0, z: 0, color: myColor, id: shortId, message: '' });
onDisconnect(myUserRef).remove();

// 2. Core Three.js Engine Viewport Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f8fa);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const roomLight = new THREE.DirectionalLight(0xffffff, 0.6);
roomLight.position.set(10, 20, 15);
roomLight.castShadow = true;
roomLight.shadow.mapSize.width = 1024;
roomLight.shadow.mapSize.height = 1024;
scene.add(roomLight);

camera.position.set(0, -8, 10);
camera.lookAt(0, 0, 0);

const remoteCursors = {};
let currentRoomGroup = new THREE.Group();
scene.add(currentRoomGroup);

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

const envSelector = document.getElementById('environment-selector');
const chatInput = document.getElementById('chat-input');

// 3. Metaverse Low-Poly Rooms Elements Mapping
function buildMetaverseRoom(roomType) {
    while(currentRoomGroup.children.length > 0){ 
        currentRoomGroup.remove(currentRoomGroup.children[0]); 
    }

    const floorGeo = new THREE.PlaneGeometry(35, 25);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe1e4e8, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    currentRoomGroup.add(floor);

    if (roomType === 'lobby-room') {
        const centralDeskGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x0366d6, roughness: 0.6 });
        const centralDesk = new THREE.Mesh(centralDeskGeo, deskMat);
        centralDesk.rotation.x = Math.PI / 2;
        centralDesk.position.set(0, 0, 0.25);
        centralDesk.castShadow = true;
        currentRoomGroup.add(centralDesk);

        const pillarGeo = new THREE.BoxGeometry(1.2, 1.2, 2);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        for(let i = 0; i < 4; i++) {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            const angle = (i * Math.PI) / 2;
            pillar.position.set(Math.cos(angle) * 6, Math.sin(angle) * 5, 1);
            pillar.castShadow = true;
            currentRoomGroup.add(pillar);
        }
    } else if (roomType === 'repository-hub') {
        const platformGeo = new THREE.BoxGeometry(5, 3, 0.4);
        const platformColors = [0x2cbe4e, 0x0366d6, 0x6f42c1];
        for (let i = 0; i < 3; i++) {
            const platformMat = new THREE.MeshStandardMaterial({ color: platformColors[i], roughness: 0.7 });
            const platform = new THREE.Mesh(platformGeo, platformMat);
            platform.position.set((i - 1) * 7, 1, 0.2);
            platform.castShadow = true;
            currentRoomGroup.add(platform);
        }
    } else if (roomType === 'agile-board') {
        const boardGeo = new THREE.BoxGeometry(10, 0.3, 4);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x24292e, roughness: 0.8 });
        const agileBoard = new THREE.Mesh(boardGeo, boardMat);
        agileBoard.position.set(0, 4, 2);
        agileBoard.rotation.x = 0.15;
        agileBoard.castShadow = true;
        currentRoomGroup.add(agileBoard);

        const noteGeo = new THREE.PlaneGeometry(0.7, 0.7);
        const noteMat = new THREE.MeshStandardMaterial({ color: 0xffea7f, roughness: 0.9, side: THREE.DoubleSide });
        for(let j = 0; j < 5; j++) {
            const note = new THREE.Mesh(noteGeo, noteMat);
            note.position.set(-2.8 + (j * 1.4), 3.85, 2.2);
            note.rotation.x = 0.15;
            currentRoomGroup.add(note);
        }
    }
}

// 4. Interface Tags Generation Mechanics
function createNametagAndBubble(name, message, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 128);

    if (message) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(10, 10, 236, 50, 8) : ctx.fillRect(10, 10, 236, 50);
        ctx.fill();
        ctx.strokeStyle = '#e1e4e8';
        ctx.stroke();

        ctx.fillStyle = '#24292e';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        let text = message.length > 28 ? message.substring(0, 25) + '...' : message;
        ctx.fillText(text, 128, 38);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(48, 75, 160, 32, 6) : ctx.fillRect(48, 75, 160, 32);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#24292e';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Dev_${name}`, 128, 95);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3, 1.5, 1);
    return sprite;
}

function instantiateRemoteCursor(id, data) {
    const devCursorGroup = new THREE.Group();

    const pointerShape = new THREE.Shape();
    pointerShape.moveTo(0, 0);
    pointerShape.lineTo(0.5, -0.5);
    pointerShape.lineTo(0.22, -0.5);
    pointerShape.lineTo(0.35, -0.9);
    pointerShape.lineTo(0.18, -0.95);
    pointerShape.lineTo(0.05, -0.58);
    pointerShape.lineTo(-0.2, -0.75);
    pointerShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
    const geometry = new THREE.ExtrudeGeometry(pointerShape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(data.color), roughness: 0.3 });
    
    const cursorMesh = new THREE.Mesh(geometry, material);
    cursorMesh.castShadow = true;
    devCursorGroup.add(cursorMesh);

    const labelSprite = createNametagAndBubble(data.id, data.message, data.color);
    labelSprite.position.set(0.6, 0.5, 0.6);
    devCursorGroup.add(labelSprite);
    devCursorGroup.labelSprite = labelSprite;

    devCursorGroup.position.set(data.x, data.y, data.z);
    scene.add(devCursorGroup);
    remoteCursors[id] = devCursorGroup;
}

// 5. Cloud Sync Observers (Replacing Backend Servers nodes)
onValue(ref(db, 'devs'), (snapshot) => {
    const currentDevs = snapshot.val() || {};
    
    // Remove users who dropped out
    Object.keys(remoteCursors).forEach(id => {
        if (!currentDevs[id]) {
            scene.remove(remoteCursors[id]);
            delete remoteCursors[id];
        }
    });

    // Spawn or update users indicators active elements
    Object.keys(currentDevs).forEach(id => {
        if (id === myUserId) return; // Skip updating yourself

        if (!remoteCursors[id]) {
            instantiateRemoteCursor(id, currentDevs[id]);
        } else {
            // Smoothly move or update chat properties nodes meshes
            remoteCursors[id].position.set(currentDevs[id].x, currentDevs[id].y, currentDevs[id].z);
            
            // Re-draw text labels if text values updated
            remoteCursors[id].remove(remoteCursors[id].labelSprite);
            const labelSprite = createNametagAndBubble(currentDevs[id].id, currentDevs[id].message, currentDevs[id].color);
            labelSprite.position.set(0.6, 0.5, 0.6);
            remoteCursors[id].labelSprite = labelSprite;
            remoteCursors[id].add(labelSprite);
        }
    });
});

onValue(roomRef, (snapshot) => {
    const roomType = snapshot.val() || 'lobby-room';
    envSelector.value = roomType;
    buildMetaverseRoom(roomType);
});

// 6. Native Browser Mouse Matrix Conversions Capture
window.addEventListener('mousemove', (event) => {
    mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouseVector, camera);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersectionPoint);

    update(myUserRef, {
        x: intersectionPoint.x,
        y: intersectionPoint.y,
        z: intersectionPoint.z
    });
});

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        update(myUserRef, { message: chatInput.value });
        setTimeout(() => { chatInput.value = ''; }, 10);
    }
});

envSelector.addEventListener('change', (e) => {
    set(roomRef, e.target.value);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});
function runEngineLoop() {
requestAnimationFrame(runEngineLoop);
renderer.render(scene, camera);
}
runEngineLoop();
