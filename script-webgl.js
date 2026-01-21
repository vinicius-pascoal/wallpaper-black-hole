// ===================================
// SCRIPT WEBGL COM THREE.JS + SHADERS GLSL
// ===================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js';

import { vertexShader, gravitationalLensShader, accretionDiskShader } from './shaders.js';

// Presets de Buracos Negros Famosos
const BLACK_HOLE_PRESETS = {
  sagittarius: {
    name: 'Sagittarius A*',
    mass: 4.1e6, // Massas solares
    displayMass: 200,
    schwarzschildRadius: 70,
    particleCount: 800,
    accretionSpeed: 3,
    description: 'Buraco negro supermassivo no centro da Via Láctea',
    color: [0.9, 0.7, 0.3], // Alaranjado
    jets: true,
    hawking: true
  },
  m87: {
    name: 'M87*',
    mass: 6.5e9, // Massas solares
    displayMass: 280,
    schwarzschildRadius: 120,
    particleCount: 1500,
    accretionSpeed: 8,
    description: 'Primeiro buraco negro fotografado pela Event Horizon Telescope',
    color: [1.0, 0.5, 0.2], // Laranja intenso
    jets: true,
    hawking: true
  },
  cygnus: {
    name: 'Cygnus X-1',
    mass: 21, // Massas solares
    displayMass: 120,
    schwarzschildRadius: 45,
    particleCount: 400,
    accretionSpeed: 15,
    description: 'Sistema binário de raio-X, primeiro buraco negro estelar confirmado',
    color: [0.4, 0.7, 1.0], // Azul (raio-X)
    jets: true,
    hawking: false
  },
  custom: {
    name: 'Personalizado',
    displayMass: 150,
    schwarzschildRadius: 80,
    particleCount: 300,
    accretionSpeed: 5,
    description: 'Configure seus próprios parâmetros',
    color: [0.8, 0.3, 0.9], // Roxo
    jets: true,
    hawking: true
  }
};

// Three.js Setup
let scene, camera, renderer, composer;
let blackHoleMesh, accretionDiskMesh;
let particles = [];
let stats = { fps: 0, lastTime: performance.now(), frames: 0 };

// Config
let config = {
  currentPreset: 'custom',
  blackHoleMass: 150,
  particleCount: 300,
  gravityStrength: 500,
  lensStrength: 50,
  accretionSpeed: 5,
  distortionEnabled: true,
  infiniteZoom: true,
  glslLens: true,
  eventHorizon: 80,
  schwarzschildRadius: 60,
  relativisticJets: true,
  hawkingRadiation: true,
  ergosphere: true,
  frameDragging: true,
  timeDilation: true
};

// Canvas 2D para overlay de partículas
const canvas = document.getElementById('blackHoleCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let width, height, centerX, centerY;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;

  if (camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
    if (window.lensPass) {
      window.lensPass.uniforms.resolution.value.set(width, height);
    }
  }
}

// Inicializar Three.js
function initThreeJS() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
  camera.position.z = 500;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById('container').appendChild(renderer.domElement);

  // Post-processing para lente gravitacional GLSL
  const renderTarget = new THREE.WebGLRenderTarget(width, height);

  composer = new EffectComposer(renderer, renderTarget);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Shader Pass para lente gravitacional
  const lensPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      blackHolePos: { value: new THREE.Vector2(0.5, 0.5) },
      schwarzschildRadius: { value: config.schwarzschildRadius },
      lensStrength: { value: config.lensStrength / 100 },
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(width, height) }
    },
    vertexShader: vertexShader,
    fragmentShader: gravitationalLensShader
  });
  // Render the lens pass to screen; if GLSL is disabled, we'll fall back to renderer directly
  lensPass.renderToScreen = true;

  if (config.glslLens) {
    composer.addPass(lensPass);
  }

  window.lensPass = lensPass; // Para atualizar depois

  // Background com estrelas
  createStarField();

  // Criar disco de acreção com shader
  createAccretionDisk();

  // Criar buraco negro
  createBlackHole();

  // Adicionar luz ambiente
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // Luz pontual do disco de acreção
  const diskLight = new THREE.PointLight(0xff6600, 2, 500);
  diskLight.position.set(0, 0, 0);
  scene.add(diskLight);
}

// Criar campo de estrelas
function createStarField() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;

    // Posição esférica
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 2000 + Math.random() * 1000;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Cores variadas (branco a azul claro)
    const temp = Math.random();
    colors[i3] = 0.8 + temp * 0.2;
    colors[i3 + 1] = 0.8 + temp * 0.2;
    colors[i3 + 2] = 0.9 + temp * 0.1;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const starMaterial = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

// Criar disco de acreção com shader custom
function createAccretionDisk() {
  const geometry = new THREE.PlaneGeometry(500, 500, 128, 128);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(width, height) },
      blackHolePos: { value: new THREE.Vector2(width / 2, height / 2) },
      innerRadius: { value: config.schwarzschildRadius * 1.5 },
      outerRadius: { value: config.schwarzschildRadius * 8 },
      speed: { value: config.accretionSpeed }
    },
    vertexShader: vertexShader,
    fragmentShader: accretionDiskShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });

  accretionDiskMesh = new THREE.Mesh(geometry, material);
  accretionDiskMesh.position.z = -50;
  scene.add(accretionDiskMesh);
}

// Criar buraco negro central
function createBlackHole() {
  const geometry = new THREE.SphereGeometry(config.schwarzschildRadius, 64, 64);

  // Shader personalizado para o buraco negro
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                // Sombra profunda com leve brilho nas bordas
                float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                vec3 color = vec3(0.0);
                
                // Brilho de Hawking radiation nas bordas
                color += vec3(0.5, 0.3, 0.8) * fresnel * 0.3;
                
                // Pulsação sutil
                color *= 1.0 + sin(time * 0.5) * 0.1;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
    side: THREE.FrontSide
  });

  blackHoleMesh = new THREE.Mesh(geometry, material);
  scene.add(blackHoleMesh);
}

// Sistema de Partículas (mantém o 2D canvas overlay)
class Particle {
  constructor(respawn = false) {
    if (respawn) {
      this.respawn();
    } else {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.life = 1.0;
    this.maxLife = 1.0;
    this.size = Math.random() * 2 + 0.5;
    this.hue = Math.random() * 60 + 200;
    this.trail = [];
  }

  respawn() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * Math.max(width, height) * 0.7 + 300;
    this.x = centerX + Math.cos(angle) * distance;
    this.y = centerY + Math.sin(angle) * distance;
  }

  update() {
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist > 1) {
      const force = (config.gravityStrength * config.blackHoleMass) / distSq;
      const angle = Math.atan2(dy, dx);

      this.vx += Math.cos(angle) * force;
      this.vy += Math.sin(angle) * force;

      const tangentialAngle = angle + Math.PI / 2;
      const tangentialForce = force * 0.3 * config.accretionSpeed;
      this.vx += Math.cos(tangentialAngle) * tangentialForce;
      this.vy += Math.sin(tangentialAngle) * tangentialForce;
    }

    this.vx *= 0.99;
    this.vy *= 0.99;

    this.x += this.vx;
    this.y += this.vy;

    if (dist < config.schwarzschildRadius) {
      this.life -= 0.05;
      if (this.life <= 0) {
        this.respawn();
        this.life = 1.0;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.trail = [];
      }
    }

    if (config.infiniteZoom) {
      if (this.x < -100 || this.x > width + 100 ||
        this.y < -100 || this.y > height + 100) {
        const angle = Math.atan2(this.y - centerY, this.x - centerX);
        this.x = centerX - Math.cos(angle) * (Math.max(width, height) * 0.5);
        this.y = centerY - Math.sin(angle) * (Math.max(width, height) * 0.5);
      }
    }

    if (dist < 400) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) this.trail.shift();
    } else {
      this.trail = [];
    }
  }

  draw() {
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.strokeStyle = `hsla(${this.hue}, 100%, 60%, ${this.life * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Spaghettification
    let ellipseRatio = 1;
    if (dist < config.schwarzschildRadius * 2) {
      ellipseRatio = 1 + (1 - dist / (config.schwarzschildRadius * 2)) * 3;
    }

    // Redshift
    let hue = this.hue;
    if (dist < config.schwarzschildRadius * 3) {
      const redshiftFactor = (config.schwarzschildRadius * 3 - dist) /
        (config.schwarzschildRadius * 3);
      hue += redshiftFactor * 80;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    const angle = Math.atan2(dy, dx);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * ellipseRatio, this.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${this.life})`;
    ctx.fill();

    ctx.restore();
  }
}

// Inicializar partículas
function initParticles() {
  particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle());
  }
}

// Aplicar preset
function applyPreset(presetName) {
  const preset = BLACK_HOLE_PRESETS[presetName];
  if (!preset) return;

  config.currentPreset = presetName;
  config.blackHoleMass = preset.displayMass;
  config.schwarzschildRadius = preset.schwarzschildRadius;
  config.eventHorizon = preset.schwarzschildRadius * 1.5;
  config.accretionSpeed = preset.accretionSpeed;

  // Atualizar sliders
  document.getElementById('massSlider').value = preset.displayMass;
  document.getElementById('massValue').textContent = preset.displayMass;
  document.getElementById('accretionSpeed').value = preset.accretionSpeed;
  document.getElementById('accretionValue').textContent = preset.accretionSpeed;

  // Atualizar partículas
  if (preset.particleCount !== config.particleCount) {
    config.particleCount = preset.particleCount;
    document.getElementById('particleCount').value = preset.particleCount;
    document.getElementById('particleValue').textContent = preset.particleCount;
    initParticles();
  }

  // Atualizar disco de acreção
  if (accretionDiskMesh) {
    accretionDiskMesh.material.uniforms.innerRadius.value = preset.schwarzschildRadius * 1.5;
    accretionDiskMesh.material.uniforms.outerRadius.value = preset.schwarzschildRadius * 8;
    accretionDiskMesh.material.uniforms.speed.value = preset.accretionSpeed;
  }

  // Atualizar buraco negro
  if (blackHoleMesh) {
    blackHoleMesh.scale.set(
      preset.schwarzschildRadius / 60,
      preset.schwarzschildRadius / 60,
      preset.schwarzschildRadius / 60
    );
  }

  // Atualizar shader de lente
  if (window.lensPass) {
    window.lensPass.uniforms.schwarzschildRadius.value = preset.schwarzschildRadius;
  }

  console.log(`Preset aplicado: ${preset.name} - ${preset.description}`);
}

// Animation Loop
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  // Atualizar uniforms de tempo
  if (blackHoleMesh) {
    blackHoleMesh.material.uniforms.time.value = time;
  }
  if (accretionDiskMesh) {
    accretionDiskMesh.material.uniforms.time.value = time;
  }
  if (window.lensPass && config.glslLens) {
    window.lensPass.uniforms.time.value = time;
    window.lensPass.uniforms.schwarzschildRadius.value = config.schwarzschildRadius;
    window.lensPass.uniforms.lensStrength.value = config.lensStrength / 100;
  }

  // Rotação suave do disco
  if (accretionDiskMesh) {
    accretionDiskMesh.rotation.z += 0.001 * config.accretionSpeed;
  }

  // Render Three.js
  if (config.glslLens) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }

  // Canvas 2D overlay para partículas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  // Desenhar efeitos avançados (ergosphere, frame dragging, etc.)
  drawAdvancedEffects();
}

function drawAdvancedEffects() {
  if (config.ergosphere) {
    drawErgosphere();
  }
  if (config.frameDragging) {
    drawFrameDragging();
  }
}

function drawErgosphere() {
  const radius = config.schwarzschildRadius * 1.2;
  const pulse = Math.sin(time * 2) * 0.1 + 0.9;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(138, 43, 226, ${0.3 * pulse})`;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawFrameDragging() {
  const spirals = 8;
  const maxRadius = config.schwarzschildRadius * 2;

  for (let i = 0; i < spirals; i++) {
    ctx.beginPath();
    const startAngle = (i / spirals) * Math.PI * 2 + time * 0.5;

    for (let r = config.schwarzschildRadius * 1.2; r < maxRadius; r += 5) {
      const angle = startAngle + (r / maxRadius) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (r === config.schwarzschildRadius * 1.2) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    const alpha = 0.2 * (1 - Math.abs(Math.sin(time + i)));
    ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Event Listeners para controles
function setupControls() {
  document.getElementById('massSlider').addEventListener('input', (e) => {
    config.blackHoleMass = parseInt(e.target.value);
    document.getElementById('massValue').textContent = config.blackHoleMass;
    config.schwarzschildRadius = 60 * (config.blackHoleMass / 150);
    config.eventHorizon = config.schwarzschildRadius * 1.5;

    if (config.currentPreset !== 'custom') {
      document.getElementById('presetSelector').value = 'custom';
      config.currentPreset = 'custom';
    }
  });

  document.getElementById('particleCount').addEventListener('input', (e) => {
    const newCount = parseInt(e.target.value);
    document.getElementById('particleValue').textContent = newCount;

    if (newCount > config.particleCount) {
      for (let i = config.particleCount; i < newCount; i++) {
        particles.push(new Particle());
      }
    } else {
      particles = particles.slice(0, newCount);
    }
    config.particleCount = newCount;
  });

  document.getElementById('gravityStrength').addEventListener('input', (e) => {
    config.gravityStrength = parseInt(e.target.value);
    document.getElementById('gravityValue').textContent = config.gravityStrength;
  });

  document.getElementById('lensStrength').addEventListener('input', (e) => {
    config.lensStrength = parseInt(e.target.value);
    document.getElementById('lensValue').textContent = config.lensStrength;
  });

  document.getElementById('accretionSpeed').addEventListener('input', (e) => {
    config.accretionSpeed = parseInt(e.target.value);
    document.getElementById('accretionValue').textContent = config.accretionSpeed;
    if (accretionDiskMesh) {
      accretionDiskMesh.material.uniforms.speed.value = config.accretionSpeed;
    }
  });

  // Preset selector
  document.getElementById('presetSelector').addEventListener('change', (e) => {
    applyPreset(e.target.value);
  });

  // Checkboxes
  document.getElementById('distortionToggle').addEventListener('change', (e) => {
    config.distortionEnabled = e.target.checked;
  });

  document.getElementById('infiniteZoom').addEventListener('change', (e) => {
    config.infiniteZoom = e.target.checked;
  });

  document.getElementById('glslLens').addEventListener('change', (e) => {
    config.glslLens = e.target.checked;
  });

  document.getElementById('relativisticJets').addEventListener('change', (e) => {
    config.relativisticJets = e.target.checked;
  });

  document.getElementById('hawkingRadiation').addEventListener('change', (e) => {
    config.hawkingRadiation = e.target.checked;
  });

  document.getElementById('ergosphere').addEventListener('change', (e) => {
    config.ergosphere = e.target.checked;
  });

  document.getElementById('frameDragging').addEventListener('change', (e) => {
    config.frameDragging = e.target.checked;
  });

  document.getElementById('timeDilation').addEventListener('change', (e) => {
    config.timeDilation = e.target.checked;
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    applyPreset('custom');
    location.reload();
  });
}

// Controle de visibilidade do painel
const controls = document.querySelector('.controls');
const toggleBtn = document.getElementById('toggleControls');
let isPinned = false;

controls.addEventListener('mouseenter', () => {
  if (!isPinned) {
    document.querySelector('.control-panel').classList.remove('hidden');
  }
});

controls.addEventListener('mouseleave', () => {
  if (!isPinned) {
    document.querySelector('.control-panel').classList.add('hidden');
  }
});

toggleBtn.addEventListener('click', () => {
  isPinned = !isPinned;
  toggleBtn.textContent = isPinned ? '📌' : '⚙️';
  toggleBtn.title = isPinned ? 'Clique para destravar' : 'Clique para travar aberto';

  if (!isPinned) {
    document.querySelector('.control-panel').classList.add('hidden');
  } else {
    document.querySelector('.control-panel').classList.remove('hidden');
  }
});

// Inicialização
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

initThreeJS();
initParticles();
setupControls();
animate();

console.log('🌑 Buraco Negro WebGL + GLSL inicializado com sucesso!');
console.log('Presets disponíveis:', Object.keys(BLACK_HOLE_PRESETS));
