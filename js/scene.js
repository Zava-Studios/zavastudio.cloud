(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('canvas-bg');
  if (!canvas) return;

  const isMobile = window.innerWidth < 900;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
  });
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050810, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 6, 22);
  camera.lookAt(0, 0, 0);

  // ── Lights ────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x0a0f1e, 1.2);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x00d4ff, 2.5, 60);
  keyLight.position.set(10, 14, 12);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x7b2fff, 1.5, 50);
  fillLight.position.set(-12, 8, -6);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x00ffaa, 0.8, 40);
  rimLight.position.set(0, -6, -14);
  scene.add(rimLight);

  // ── Neural network nodes ──────────────────────────────────────
  const NODE_COUNT = isMobile ? 60 : 120;
  const RANGE = 20;

  const nodePositions = [];
  const nodes = [];

  const nodeGeo = new THREE.SphereGeometry(0.1, isMobile ? 4 : 8, isMobile ? 4 : 8);

  for (let i = 0; i < NODE_COUNT; i++) {
    const x = (Math.random() - 0.5) * RANGE * 2;
    const y = (Math.random() - 0.5) * RANGE * 0.8;
    const z = (Math.random() - 0.5) * RANGE * 1.2 - 4;

    nodePositions.push(new THREE.Vector3(x, y, z));

    const intensity = Math.random();
    const color = intensity > 0.5 ? 0x00d4ff : 0x7b2fff;
    const nodeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 + intensity * 0.4 });
    const mesh = new THREE.Mesh(nodeGeo, nodeMat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    nodes.push({ mesh, speed: 0.0002 + Math.random() * 0.0003, phase: Math.random() * Math.PI * 2 });
  }

  // ── Edges between nearby nodes ────────────────────────────────
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.12,
  });

  const MAX_DIST = isMobile ? 5 : 6;

  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const dist = nodePositions[i].distanceTo(nodePositions[j]);
      if (dist < MAX_DIST) {
        const points = [nodePositions[i], nodePositions[j]];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, edgeMaterial);
        scene.add(line);
      }
    }
  }

  // ── Grid plane ────────────────────────────────────────────────
  if (!isMobile) {
    const gridHelper = new THREE.GridHelper(40, 20, 0x00d4ff, 0x0a1628);
    gridHelper.position.y = -8;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
  }

  // ── Floating hexagonal rings ───────────────────────────────────
  const ringCount = isMobile ? 3 : 6;
  const rings = [];

  for (let i = 0; i < ringCount; i++) {
    const radius = 1.5 + Math.random() * 4;
    const geo = new THREE.TorusGeometry(radius, 0.015, 4, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00d4ff : 0x7b2fff,
      transparent: true,
      opacity: 0.08 + Math.random() * 0.1,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 12 - 4
    );
    ring.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(ring);
    rings.push({ mesh: ring, rx: 0.001 + Math.random() * 0.002, ry: 0.001 + Math.random() * 0.002 });
  }

  // ── Scroll camera ─────────────────────────────────────────────
  let scrollProgress = 0;
  let targetScroll = 0;
  const camStart = { x: 0, y: 6, z: 22 };
  const camEnd   = { x: 4, y: 2, z: 14 };

  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    targetScroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  });

  // ── Resize ────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Render loop ───────────────────────────────────────────────
  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    frame++;

    scrollProgress += (targetScroll - scrollProgress) * 0.04;

    camera.position.x = camStart.x + (camEnd.x - camStart.x) * scrollProgress;
    camera.position.y = camStart.y + (camEnd.y - camStart.y) * scrollProgress;
    camera.position.z = camStart.z + (camEnd.z - camStart.z) * scrollProgress;
    camera.lookAt(0, 0, 0);

    const t = frame * 0.005;

    nodes.forEach((node) => {
      node.mesh.position.y += Math.sin(t + node.phase) * node.speed;
    });

    rings.forEach((r) => {
      r.mesh.rotation.x += r.rx;
      r.mesh.rotation.y += r.ry;
    });

    keyLight.position.x = Math.sin(t * 0.4) * 12;
    keyLight.position.z = Math.cos(t * 0.4) * 12;

    renderer.render(scene, camera);
  }

  animate();
})();
