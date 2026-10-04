// ============================================================================
// GLOBAL RENDER ENGINE & COMPONENT REGISTRIES
// ============================================================================
let scene, camera, renderer;

function initEngine() {
  console.log("[STAGE] Initiating Three.js direct graphics viewport standard pipelines...");
  
  // 1. Scene setup configuration
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#110f1a');

  // 2. Camera matrices alignments
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 25);
  camera.lookAt(0, 0, 0);

  // 3. Lighting structures implementation
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(10, 25, 10);
  scene.add(directionalLight);

  // 4. Renderer execution hooks layout binding
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 5. Build foundational testing matrix block geometry setups
  buildProceduralSandboxWorld(scene);

  // 6. Handle canvas element updates across window viewport resize triggers
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

function buildProceduralSandboxWorld(targetScene) {
  // Generate a flat structural landing pad ground surface color
  const floorGeometry = new THREE.BoxGeometry(35, 0.4, 35);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: "#221f3b", roughness: 0.5 });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.position.set(0, -0.2, 0);
  targetScene.add(floorMesh);

  // Generate a prominent bright core box mesh element central pillar
  const coreBoxGeometry = new THREE.BoxGeometry(5, 5, 5);
  const coreBoxMaterial = new THREE.MeshStandardMaterial({ color: "#39d353", roughness: 0.3 });
  const coreBoxMesh = new THREE.Mesh(coreBoxGeometry, coreBoxMaterial);
  coreBoxMesh.position.set(0, 2.5, 0);
  targetScene.add(coreBoxMesh);

  console.log("[STAGE] Built local test map layouts geometry anchors safely.");
}

function animate() {
  requestAnimationFrame(animate);
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Ensure the execution hook context drops strictly after full page initialization sequences
window.addEventListener('DOMContentLoaded', () => {
  initEngine();
});
