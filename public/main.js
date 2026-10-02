import * as THREE from 'https://cloudflare.com';

const socket = io();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf6f8fa);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const roomLight = new THREE.DirectionalLight(0xffffff, 0.6);
roomLight.position.set(10, 20, 15);
roomLight.castShadow = true;
roomLight.shadow.mapSize.width = 2048;
roomLight.shadow.mapSize.height = 2048;
roomLight.shadow.camera.near = 0.5;
roomLight.shadow.camera.far = 40;
const d = 15;
roomLight.shadow.camera.left = -d;
roomLight.shadow.camera.right = d;
roomLight.shadow.camera.top = d;
roomLight.shadow.camera.bottom = -d;
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
        centralDesk.receiveShadow = true;
        currentRoomGroup.add(centralDesk);

        const pillarGeo = new THREE.BoxGeometry(1.2, 1.2, 2);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        for(let i = 0; i < 4; i++) {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            const angle = (i * Math.PI) / 2;
            pillar.position.set(Math.cos(angle) * 6, Math.sin(angle) * 5, 1);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            currentRoomGroup.add(pillar);
        }

    } else if (roomType === 'repository-hub') {
        const platformGeo = new THREE.BoxGeometry(5, 3, 0.4);
        const colors = [0x2cbe4e, 0x0366d6, 0x6f42c1];
        
        for (let i = 0; i < 3; i++) {
            const platformMat = new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.7 });
            const platform = new THREE.Mesh(platformGeo, platformMat);
            platform.position.set((i - 1) * 7, 1, 0.2);
            platform.castShadow = true;
            platform.receiveShadow = true;
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
        for(let j = 0; j < 6; j++) {
            const note = new THREE.Mesh(noteGeo, noteMat);
            note.position.set(-3.5 + (j * 1.4), 3.85, 2.2);
            note.rotation.x = 0.15;
            currentRoomGroup.add(note);
        }
    }
}

function createNametagAndBubble(name, message, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, 256, 128);

    if (message) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.roundRect(10, 10, 236, 50, 8);
        ctx.fill();
        ctx.strokeStyle = '#e1e4e8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#24292e';
        ctx.font = '12px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        
        let text = message;
        if(text.length > 28) text = text.substring(0, 25) + '...';
        ctx.fillText(text, 128, 38);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(48, 75, 160, 32, 6);
    ctx.fill();
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#24292e';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Dev_${name}`, 128, 95);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3, 1.5, 1);
    return sprite;
}

function updateRemoteCursorElements(id) {
    const data = remoteCursors[id].userData;
    if (remoteCursors[id].labelSprite) {
        remoteCursors[id].remove(remoteCursors[id].labelSprite);
    }
    const labelSprite = createNametagAndBubble(data.label, data.message, data.color);
    labelSprite.position.set(0.6, 0.5, 0.6);
    remoteCursors[id].labelSprite = labelSprite;
    remoteCursors[id].add(labelSprite);
}

function instantiateRemoteCursor(id, hexColor, initialLabel) {
    const devCursorGroup = new THREE.Group();
    devCursorGroup.userData = { color: hexColor, label: initialLabel, message: '' };

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
    
    const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(hexColor),
        roughness: 0.3,
        metalness: 0.1
    });
    
    const cursorMesh = new THREE.Mesh(geometry, material);
    cursorMesh.castShadow = true;
    devCursorGroup.add(cursorMesh);

    remoteCursors[id] = devCursorGroup;
    updateRemoteCursorElements(id);

    scene.add(devCursorGroup);
}

socket.on('initWorkspaceState', (state) => {
    buildMetaverseRoom(state.currentMap);
    envSelector.value = state.currentMap;

    Object.keys(state.devs).forEach((id) => {
        if (id !== socket.id) {
            instantiateRemoteCursor(id, state.devs[id].color, state.devs[id].id);
            if(state.devs[id].message) {
                remoteCursors[id].userData.message = state.devs[id].message;
                updateRemoteCursorElements(id);
            }
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

socket.on('messageReceived', (data) => {
    if (remoteCursors[data.id]) {
        remoteCursors[data.id].userData.message = data.message;
        updateRemoteCursorElements(data.id);
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

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        socket.emit('sendMessage', chatInput.value);
        setTimeout(() => { chatInput.value = ''; }, 10);
    }
});

envSelector.addEventListener('change', (e) => {
    socket.emit('switchMap', e.target.value);
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
