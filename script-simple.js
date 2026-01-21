// ===================================
// VERSÃO SIMPLIFICADA - CANVAS 2D COM WEBGL OPCIONAL
// ===================================

// Presets de Buracos Negros Famosos
const BLACK_HOLE_PRESETS = {
  sagittarius: {
    name: 'Sagittarius A*',
    displayMass: 200,
    schwarzschildRadius: 70,
    particleCount: 800,
    accretionSpeed: 3,
    description: 'Buraco negro supermassivo no centro da Via Láctea'
  },
  m87: {
    name: 'M87*',
    displayMass: 280,
    schwarzschildRadius: 120,
    particleCount: 1500,
    accretionSpeed: 8,
    description: 'Primeiro buraco negro fotografado pela Event Horizon Telescope'
  },
  cygnus: {
    name: 'Cygnus X-1',
    displayMass: 120,
    schwarzschildRadius: 45,
    particleCount: 400,
    accretionSpeed: 15,
    description: 'Sistema binário de raio-X, primeiro buraco negro estelar confirmado'
  },
  custom: {
    name: 'Personalizado',
    displayMass: 150,
    schwarzschildRadius: 80,
    particleCount: 300,
    accretionSpeed: 5,
    description: 'Configure seus próprios parâmetros'
  }
};

// Canvas Setup
const canvas = document.getElementById('blackHoleCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

let width, height, centerX, centerY;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
}

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
  glslLens: false, // Desabilitado por padrão
  eventHorizon: 80,
  schwarzschildRadius: 60,
  relativisticJets: true,
  hawkingRadiation: true,
  ergosphere: true,
  frameDragging: true,
  timeDilation: true
};

// Sistema de Partículas
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

// Disco de Acreção
class AccretionDisk {
  constructor() {
    this.rings = 8;
    this.particles = [];
    this.hotspots = [];

    for (let i = 0; i < 5; i++) {
      this.hotspots.push({
        angle: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.002,
        intensity: Math.random()
      });
    }
  }

  update() {
    this.hotspots.forEach(hotspot => {
      hotspot.angle += hotspot.speed * config.accretionSpeed;
    });
  }

  draw() {
    const innerRadius = config.schwarzschildRadius * 1.5;
    const outerRadius = config.schwarzschildRadius * 8;

    for (let ring = 0; ring < this.rings; ring++) {
      const radius = innerRadius + (outerRadius - innerRadius) * (ring / this.rings);
      const nextRadius = innerRadius + (outerRadius - innerRadius) * ((ring + 1) / this.rings);

      const temperature = 1 - (ring / this.rings);

      let r, g, b;
      if (temperature > 0.7) {
        r = 255; g = 255; b = 200 + temperature * 55;
      } else if (temperature > 0.4) {
        r = 255; g = 150 + temperature * 105; b = 0;
      } else {
        r = 200 + temperature * 55; g = 0; b = 0;
      }

      const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, nextRadius);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.3 * temperature})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${0.1 * temperature})`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, nextRadius, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Hotspots
      this.hotspots.forEach(hotspot => {
        const hotspotX = centerX + Math.cos(hotspot.angle) * radius;
        const hotspotY = centerY + Math.sin(hotspot.angle) * radius;
        const hotspotSize = 20 + hotspot.intensity * 30;

        const hotspotGradient = ctx.createRadialGradient(
          hotspotX, hotspotY, 0,
          hotspotX, hotspotY, hotspotSize
        );
        hotspotGradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * temperature})`);
        hotspotGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = hotspotGradient;
        ctx.fillRect(hotspotX - hotspotSize, hotspotY - hotspotSize,
          hotspotSize * 2, hotspotSize * 2);
      });
    }
  }
}

// Jatos Relativísticos
class RelativisticJet {
  constructor(isTop) {
    this.isTop = isTop;
    this.particles = [];
    this.maxParticles = 50;
  }

  update() {
    if (this.particles.length < this.maxParticles && Math.random() < 0.1) {
      this.particles.push({
        x: centerX,
        y: centerY,
        vy: this.isTop ? -5 - Math.random() * 5 : 5 + Math.random() * 5,
        life: 1.0,
        hue: 180 + Math.random() * 40
      });
    }

    this.particles = this.particles.filter(p => {
      p.y += p.vy;
      p.life -= 0.01;
      return p.life > 0 && p.y > -200 && p.y < height + 200;
    });
  }

  draw() {
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
      ctx.fill();
    });
  }
}

// Radiação Hawking
class HawkingRadiation {
  constructor() {
    this.particles = [];
    this.maxParticles = 30;
  }

  update() {
    if (this.particles.length < this.maxParticles && Math.random() < 0.05) {
      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        x: centerX + Math.cos(angle) * config.schwarzschildRadius,
        y: centerY + Math.sin(angle) * config.schwarzschildRadius,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 1.0,
        hue: Math.random() * 360
      });
    }

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });
  }

  draw() {
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
      ctx.fill();
    });
  }
}

// Background com estrelas
function drawStarField() {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.twinkle = (star.twinkle + 0.02) % (Math.PI * 2);
    const opacity = 0.3 + Math.sin(star.twinkle) * 0.2;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
  }
}

// Desenhar buraco negro
function drawBlackHole() {
  const time = Date.now() * 0.001;

  // Sombra M87-inspired com gradiente mais profundo
  const shadowRadius = config.schwarzschildRadius * 2.6;
  const shadowGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, shadowRadius
  );
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
  shadowGradient.addColorStop(0.3, 'rgba(5, 0, 10, 1)');
  shadowGradient.addColorStop(0.6, 'rgba(10, 5, 20, 0.98)');
  shadowGradient.addColorStop(0.85, 'rgba(20, 10, 35, 0.8)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, shadowRadius, 0, Math.PI * 2);
  ctx.fillStyle = shadowGradient;
  ctx.fill();

  // Event Horizon com borda levemente brilhante
  ctx.beginPath();
  ctx.arc(centerX, centerY, config.schwarzschildRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fill();

  // Brilho sutil no horizonte de eventos (Hawking radiation visual)
  const horizonGlow = ctx.createRadialGradient(
    centerX, centerY, config.schwarzschildRadius * 0.98,
    centerX, centerY, config.schwarzschildRadius * 1.05
  );
  horizonGlow.addColorStop(0, 'rgba(100, 50, 150, 0)');
  horizonGlow.addColorStop(0.5, 'rgba(138, 43, 226, 0.15)');
  horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, config.schwarzschildRadius * 1.05, 0, Math.PI * 2);
  ctx.fillStyle = horizonGlow;
  ctx.fill();

  // Photon Sphere com múltiplas camadas e brilho
  const photonRadius = config.schwarzschildRadius * 1.5;
  const photonPulse = Math.sin(time * 2) * 0.1 + 0.9;

  // Camada interna brilhante
  ctx.beginPath();
  ctx.arc(centerX, centerY, photonRadius, 0, Math.PI * 2);
  const photonGradient = ctx.createRadialGradient(
    centerX, centerY, photonRadius - 5,
    centerX, centerY, photonRadius + 5
  );
  photonGradient.addColorStop(0, `rgba(255, 200, 100, ${0.6 * photonPulse})`);
  photonGradient.addColorStop(0.5, `rgba(255, 150, 50, ${0.8 * photonPulse})`);
  photonGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
  ctx.strokeStyle = photonGradient;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Camada externa suave
  ctx.beginPath();
  ctx.arc(centerX, centerY, photonRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 180, 80, ${0.3 * photonPulse})`;
  ctx.lineWidth = 8;
  ctx.stroke();

  // Einstein Ring com brilho intenso e pulsante
  const einsteinRadius = photonRadius * 1.4;
  const einsteinPulse = Math.sin(time * 1.5 + 1) * 0.15 + 0.85;

  // Brilho externo difuso
  ctx.beginPath();
  ctx.arc(centerX, centerY, einsteinRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 220, 150, ${0.2 * einsteinPulse})`;
  ctx.lineWidth = 12;
  ctx.stroke();

  // Anel principal brilhante
  ctx.beginPath();
  ctx.arc(centerX, centerY, einsteinRadius, 0, Math.PI * 2);
  const einsteinGradient = ctx.createRadialGradient(
    centerX, centerY, einsteinRadius - 6,
    centerX, centerY, einsteinRadius + 6
  );
  einsteinGradient.addColorStop(0, 'rgba(255, 240, 200, 0)');
  einsteinGradient.addColorStop(0.4, `rgba(255, 235, 180, ${0.7 * einsteinPulse})`);
  einsteinGradient.addColorStop(0.6, `rgba(255, 220, 150, ${0.9 * einsteinPulse})`);
  einsteinGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.strokeStyle = einsteinGradient;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Núcleo do anel super brilhante
  ctx.beginPath();
  ctx.arc(centerX, centerY, einsteinRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 255, 200, ${0.5 * einsteinPulse})`;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Ergosphere
function drawErgosphere() {
  const radius = config.schwarzschildRadius * 1.2;
  const pulse = Math.sin(Date.now() * 0.002) * 0.1 + 0.9;
  const time = Date.now() * 0.001;

  // Brilho externo
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(138, 43, 226, ${0.15 * pulse})`;
  ctx.lineWidth = 8;
  ctx.stroke();

  // Anel principal vibrante
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(180, 80, 255, ${0.4 * pulse})`;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Núcleo brilhante
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(220, 150, 255, ${0.3 * pulse})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Frame Dragging
function drawFrameDragging() {
  const spirals = 8;
  const maxRadius = config.schwarzschildRadius * 2;
  const time = Date.now() * 0.001;

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
    const hue = 260 + Math.sin(time * 0.5 + i) * 40; // Varia entre roxo e azul
    const saturation = 80 + Math.sin(time + i) * 20;
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 60%, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Inicializar
let particles = [];
let stars = [];
let accretionDisk;
let topJet, bottomJet;
let hawkingRad;

function initScene() {
  // Partículas
  particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle());
  }

  // Estrelas
  stars = [];
  for (let i = 0; i < 400; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2
    });
  }

  accretionDisk = new AccretionDisk();
  topJet = new RelativisticJet(true);
  bottomJet = new RelativisticJet(false);
  hawkingRad = new HawkingRadiation();
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

  document.getElementById('massSlider').value = preset.displayMass;
  document.getElementById('massValue').textContent = preset.displayMass;
  document.getElementById('accretionSpeed').value = preset.accretionSpeed;
  document.getElementById('accretionValue').textContent = preset.accretionSpeed;

  if (preset.particleCount !== config.particleCount) {
    config.particleCount = preset.particleCount;
    document.getElementById('particleCount').value = preset.particleCount;
    document.getElementById('particleValue').textContent = preset.particleCount;

    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  console.log(`Preset aplicado: ${preset.name} - ${preset.description}`);
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Clear
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.fillRect(0, 0, width, height);

  // Stars
  drawStarField();

  // Accretion Disk
  accretionDisk.update();
  accretionDisk.draw();

  // Black Hole
  drawBlackHole();

  // Effects
  if (config.ergosphere) drawErgosphere();
  if (config.frameDragging) drawFrameDragging();

  if (config.relativisticJets) {
    topJet.update();
    topJet.draw();
    bottomJet.update();
    bottomJet.draw();
  }

  if (config.hawkingRadiation) {
    hawkingRad.update();
    hawkingRad.draw();
  }

  // Particles
  particles.forEach(p => {
    p.update();
    p.draw();
  });
}

// Setup Controls
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
  });

  document.getElementById('presetSelector').addEventListener('change', (e) => {
    applyPreset(e.target.value);
  });

  document.getElementById('distortionToggle').addEventListener('change', (e) => {
    config.distortionEnabled = e.target.checked;
  });

  document.getElementById('infiniteZoom').addEventListener('change', (e) => {
    config.infiniteZoom = e.target.checked;
  });

  document.getElementById('glslLens').addEventListener('change', (e) => {
    config.glslLens = e.target.checked;
    alert('Lente GLSL requer WebGL - funcionalidade em desenvolvimento');
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

// Start
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  stars.forEach(star => {
    star.x = Math.random() * width;
    star.y = Math.random() * height;
  });
});

initScene();
setupControls();
animate();

console.log('🌑 Buraco Negro inicializado com sucesso!');
console.log('Presets disponíveis:', Object.keys(BLACK_HOLE_PRESETS));
