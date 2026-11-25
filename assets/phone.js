import * as THREE from 'three';

/**
 * Generates a 512x1024 procedural OLED display texture with deep obsidian tones,
 * titanium-ice luminous wave curves, and subtle specular depth.
 * @returns {THREE.CanvasTexture}
 */
function createScreenTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const g = c.getContext('2d');

  // Deep OLED obsidian base
  const bg = g.createLinearGradient(0, 0, 512, 1024);
  bg.addColorStop(0, '#05070b');
  bg.addColorStop(0.5, '#090d14');
  bg.addColorStop(1, '#040609');
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 1024);

  // Soft titanium-sapphire studio wave aurora
  const rad1 = g.createRadialGradient(340, 380, 12, 340, 380, 340);
  rad1.addColorStop(0, 'rgba(156, 194, 255, 0.44)');
  rad1.addColorStop(0.42, 'rgba(92, 128, 178, 0.22)');
  rad1.addColorStop(1, 'rgba(5, 8, 14, 0)');
  g.fillStyle = rad1;
  g.fillRect(0, 0, 512, 1024);

  const rad2 = g.createRadialGradient(140, 680, 10, 140, 680, 300);
  rad2.addColorStop(0, 'rgba(218, 228, 242, 0.28)');
  rad2.addColorStop(0.5, 'rgba(110, 130, 160, 0.12)');
  rad2.addColorStop(1, 'rgba(5, 8, 14, 0)');
  g.fillStyle = rad2;
  g.fillRect(0, 0, 512, 1024);

  // Sculpted S-curve metallic ribbon inspired by flagship titanium wallpapers
  g.save();
  g.beginPath();
  g.moveTo(-40, 760);
  g.bezierCurveTo(180, 580, 80, 320, 420, 190);
  g.bezierCurveTo(260, 400, 360, 620, 540, 780);
  g.closePath();
  const wave = g.createLinearGradient(60, 220, 440, 780);
  wave.addColorStop(0, 'rgba(220, 232, 248, 0.26)');
  wave.addColorStop(0.48, 'rgba(130, 165, 215, 0.14)');
  wave.addColorStop(1, 'rgba(20, 28, 42, 0.02)');
  g.fillStyle = wave;
  g.fill();
  g.restore();

  // Subtle rim highlight arc
  g.strokeStyle = 'rgba(215, 230, 250, 0.22)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(76, 820);
  g.bezierCurveTo(190, 610, 140, 360, 396, 200);
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roundedRectShape(w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function roundedSlab(w, h, d, r, bevel = 0.0005) {
  const b = Math.min(bevel, d * 0.22, w * 0.08, h * 0.08);
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
    depth: d - 2 * b,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 4,
    curveSegments: 16,
  });
  g.translate(0, 0, -d / 2 + b);
  g.computeVertexNormals();
  return g;
}

function addMesh(parent, geometry, material, name, pos = [0, 0, 0]) {
  const m = new THREE.Mesh(geometry, material);
  m.name = name;
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function cylinderZ(radius, depth, material, segments = 48) {
  const g = new THREE.CylinderGeometry(radius, radius, depth, segments);
  g.rotateX(Math.PI / 2);
  return new THREE.Mesh(g, material);
}

/**
 * Builds a procedural titanium flagship smartphone using Three.js geometry.
 * Local axes: X = width, Y = height, Z = thickness. Front display faces +Z.
 * @param {THREE.Scene} scene
 * @param {Object} [options]
 */
export function createPhone(scene, options = {}) {
  const d = {
    width: options.width ?? 0.076,
    height: options.height ?? 0.16,
    depth: options.depth ?? 0.0092,
    corner: options.corner ?? 0.0105,
  };

  const screenMap = createScreenTexture();

  const M = {
    titanium: new THREE.MeshPhysicalMaterial({
      color: 0xa4abb2,
      metalness: 0.94,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.55,
    }),
    titaniumDark: new THREE.MeshPhysicalMaterial({
      color: 0x454d56,
      metalness: 0.95,
      roughness: 0.28,
      clearcoat: 0.65,
      envMapIntensity: 1.2,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x0b0e14,
      metalness: 0.08,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.28,
      envMapIntensity: 0.85,
    }),
    rearGlass: new THREE.MeshPhysicalMaterial({
      color: 0x262b33,
      metalness: 0.22,
      roughness: 0.28,
      clearcoat: 0.75,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.25,
    }),
    screen: new THREE.MeshStandardMaterial({
      map: screenMap,
      emissiveMap: screenMap,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.92,
      roughness: 0.42,
      metalness: 0.0,
      envMapIntensity: 0.35,
    }),
    ceramic: new THREE.MeshPhysicalMaterial({
      color: 0x030507,
      metalness: 0.25,
      roughness: 0.1,
      clearcoat: 1,
    }),
    lens: new THREE.MeshPhysicalMaterial({
      color: 0x101b2d,
      metalness: 0.45,
      roughness: 0.07,
      clearcoat: 1,
      iridescence: 0.75,
    }),
    lensGlint: new THREE.MeshBasicMaterial({
      color: 0x9cc2ff,
      transparent: true,
      opacity: 0.46,
    }),
    flash: new THREE.MeshBasicMaterial({ color: 0xfff0d0 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x080a0d, metalness: 0.4, roughness: 0.45 }),
  };

  const phone = new THREE.Group();
  phone.name = 'connectly-titanium-smartphone';

  // Titanium frame + polished side rails
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'titanium-frame';
  addMesh(bodyGroup, roundedSlab(d.width, d.height, d.depth, d.corner, 0.0011), M.titanium, 'machined-titanium-chassis');
  for (const side of [-1, 1]) {
    addMesh(
      bodyGroup,
      new THREE.BoxGeometry(0.00045, d.height * 0.78, d.depth * 0.38),
      M.titaniumDark,
      'polished-side-rail',
      [side * (d.width / 2 - 0.00015), 0, 0],
    );
  }
  phone.add(bodyGroup);

  // Front display + Dynamic Island + procedural OLED texture
  const displayGroup = new THREE.Group();
  displayGroup.name = 'front-display';
  const fz = d.depth / 2 + 0.0002;
  const fw = d.width - 0.0048;
  const fh = d.height - 0.005;
  addMesh(displayGroup, roundedSlab(fw, fh, 0.00035, d.corner * 0.82, 0.00008), M.glass, 'cover-glass', [0, 0, fz]);

  const oledW = fw - 0.0016;
  const oledH = fh - 0.0016;
  const oledShape = roundedRectShape(oledW, oledH, d.corner * 0.76);
  const oledGeo = new THREE.ShapeGeometry(oledShape, 24);
  // Normalize UVs to [0,1] for the procedural OLED texture
  const posAttr = oledGeo.attributes.position;
  const uvAttr = oledGeo.attributes.uv;
  for (let i = 0; i < posAttr.count; i++) {
    uvAttr.setXY(i, posAttr.getX(i) / oledW + 0.5, posAttr.getY(i) / oledH + 0.5);
  }
  uvAttr.needsUpdate = true;
  addMesh(displayGroup, oledGeo, M.screen, 'oled-panel', [0, 0, fz + 0.00028]);

  addMesh(displayGroup, roundedSlab(0.025, 0.0066, 0.00018, 0.0033, 0.00003), M.ceramic, 'camera-island', [
    0,
    d.height * 0.415,
    fz + 0.00042,
  ]);
  const frontLens = new THREE.Mesh(new THREE.CircleGeometry(0.0011, 32), M.lens);
  frontLens.position.set(0.0072, d.height * 0.415, fz + 0.00054);
  displayGroup.add(frontLens);
  phone.add(displayGroup);

  // Rear frosted glass panel
  const backPanel = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(fw, fh, d.corner * 0.82), 24),
    M.rearGlass,
  );
  backPanel.name = 'rear-glass-panel';
  backPanel.position.z = -d.depth / 2 - 0.0002;
  backPanel.rotation.y = Math.PI;
  phone.add(backPanel);

  // Rear triple-lens camera system (group is rotated PI around Y, so local +Z maps to world -Z rear face)
  const cameraGroup = new THREE.Group();
  cameraGroup.name = 'rear-camera-system';
  cameraGroup.rotation.y = Math.PI;
  const rz = d.depth / 2 + 0.0004;
  const plate = new THREE.Mesh(
    roundedSlab(0.037, 0.043, 0.0014, 0.008, 0.0003),
    M.titaniumDark,
  );
  plate.position.set(-d.width * 0.24, d.height * 0.335, rz + 0.0004);
  cameraGroup.add(plate);

  const camBase = new THREE.Group();
  camBase.position.set(-d.width * 0.24, d.height * 0.335, rz + 0.0011);
  cameraGroup.add(camBase);

  const makeLens = (x, y, n) => {
    const lg = new THREE.Group();
    lg.name = `rear-camera-${n}`;
    lg.position.set(x, y, 0);
    lg.add(new THREE.Mesh(new THREE.TorusGeometry(0.0069, 0.00105, 12, 48), M.titanium));
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.0058, 0.0004, 10, 48), M.titaniumDark);
    inner.position.z = 0.00035;
    lg.add(inner);
    addMesh(lg, new THREE.CircleGeometry(0.0057, 48), M.ceramic, 'lens-housing', [0, 0, 0.0003]);
    const glass = cylinderZ(0.0047, 0.00075, M.lens, 48);
    glass.position.z = 0.0007;
    lg.add(glass);
    const glint = new THREE.Mesh(new THREE.CircleGeometry(0.0018, 24), M.lensGlint);
    glint.position.set(-0.0012, 0.0013, 0.0011);
    lg.add(glint);
    camBase.add(lg);
  };
  makeLens(-0.009, 0.011, 1);
  makeLens(0.009, 0.0, 2);
  makeLens(-0.009, -0.011, 3);

  const flash = new THREE.Mesh(new THREE.CircleGeometry(0.0023, 24), M.flash);
  flash.position.set(0.009, 0.011, 0.0004);
  camBase.add(flash);

  const sensor = new THREE.Mesh(new THREE.CircleGeometry(0.0016, 24), M.ceramic);
  sensor.position.set(0.009, -0.011, 0.0004);
  camBase.add(sensor);
  phone.add(cameraGroup);

  // Side buttons
  const btnGroup = new THREE.Group();
  btnGroup.name = 'side-buttons';
  const lx = -d.width / 2 - 0.00045;
  const rx = d.width / 2 + 0.00045;
  addMesh(btnGroup, roundedSlab(0.0011, 0.009, 0.002, 0.0005, 0.0002), M.titanium, 'action-button', [
    lx,
    d.height * 0.245,
    0,
  ]);
  for (const y of [0.017, -0.006]) {
    addMesh(btnGroup, roundedSlab(0.0011, 0.017, 0.002, 0.0005, 0.0002), M.titanium, 'volume-button', [lx, y, 0]);
  }
  addMesh(btnGroup, roundedSlab(0.0011, 0.026, 0.002, 0.0005, 0.0002), M.titanium, 'power-button', [
    rx,
    0.012,
    0,
  ]);
  phone.add(btnGroup);

  // Bottom USB-C & speaker grilles (facing -Y)
  const portsGroup = new THREE.Group();
  portsGroup.name = 'bottom-ports';
  const py = -d.height / 2 - 0.0001;
  const usbc = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.0002, 0.003), M.dark);
  usbc.position.set(0, py, 0);
  portsGroup.add(usbc);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.00055, 12), M.dark);
    m.rotation.x = Math.PI / 2;
    m.position.set(0.015 + i * 0.0021, py, 0);
    portsGroup.add(m);
  }
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.00055, 12), M.dark);
    m.rotation.x = Math.PI / 2;
    m.position.set(-0.015 - i * 0.0021, py, 0);
    portsGroup.add(m);
  }
  phone.add(portsGroup);

  phone.scale.setScalar(options.scale ?? 1);
  phone.rotation.set(options.rotationX ?? -0.1, options.rotationY ?? 0.52, 0);
  scene.add(phone);

  function dispose() {
    screenMap.dispose();
    phone.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(m => m.dispose());
      }
    });
    scene.remove(phone);
  }

  return {
    phone,
    parts: { bodyGroup, displayGroup, backPanel, cameraGroup, btnGroup, portsGroup },
    materials: M,
    dimensions: d,
    dispose,
  };
}

