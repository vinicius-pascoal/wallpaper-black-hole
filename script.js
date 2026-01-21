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

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Configurações do Buraco Negro
let config = {
  blackHoleMass: 150,
  particleCount: 2000,
  gravityStrength: 500,
  lensStrength: 50,
  accretionSpeed: 5,
  distortionEnabled: true,
  infiniteZoom: true,
  eventHorizon: 80,
  schwarzschildRadius: 60
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

    // Cor baseada na temperatura (Hawking radiation)
    this.hue = Math.random() * 60 + 200; // Azul para roxo
  }

  respawn() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * Math.max(width, height) * 0.7 + 300;
    this.x = centerX + Math.cos(angle) * distance;
    this.y = centerY + Math.sin(angle) * distance;
  }

  update() {
    // Distância do buraco negro
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    // Força gravitacional (F = G * M / r^2)
    if (dist > 1) {
      const force = (config.gravityStrength * config.blackHoleMass) / distSq;
      const angle = Math.atan2(dy, dx);

      this.vx += Math.cos(angle) * force;
      this.vy += Math.sin(angle) * force;

      // Adicionar componente tangencial (disco de acreção)
      const tangentialAngle = angle + Math.PI / 2;
      const tangentialForce = force * 0.3 * config.accretionSpeed;
      this.vx += Math.cos(tangentialAngle) * tangentialForce;
      this.vy += Math.sin(tangentialAngle) * tangentialForce;
    }

    // Aplicar velocidade com damping
    this.vx *= 0.99;
    this.vy *= 0.99;

    this.x += this.vx;
    this.y += this.vy;

    // Verificar se foi sugada pelo buraco negro
    if (dist < config.schwarzschildRadius) {
      this.life -= 0.05;
      if (this.life <= 0) {
        this.respawn();
        this.life = 1.0;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
      }
    }

    // Reciclagem de partículas fora da tela
    if (config.infiniteZoom) {
      if (this.x < -100 || this.x > width + 100 ||
        this.y < -100 || this.y > height + 100) {
        this.respawn();
      }
    }
  }

  draw() {
    const dx = centerX - this.x;
    const dy = centerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calcular intensidade baseada na distância
    const intensity = Math.min(1, 500 / dist);
    const alpha = this.life * intensity;

    // Efeito de redshift gravitacional
    const redshift = Math.max(0, 1 - dist / 500);
    const hue = this.hue + redshift * 60;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
    ctx.fill();

    // Glow effect para partículas próximas
    if (dist < 300) {
      ctx.shadowBlur = 10 * intensity;
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

// Array de partículas
let particles = [];

function initParticles() {
  particles = [];
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle());
  }
}

// Disco de Acreção
class AccretionDisk {
  constructor() {
    this.rings = [];
    this.numRings = 15;
    this.minRadius = config.schwarzschildRadius + 20;
    this.maxRadius = config.eventHorizon + 150;

    for (let i = 0; i < this.numRings; i++) {
      this.rings.push({
        radius: this.minRadius + (this.maxRadius - this.minRadius) * (i / this.numRings),
        speed: 0.02 - (i / this.numRings) * 0.015,
        angle: Math.random() * Math.PI * 2,
        thickness: 3 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
  }

  update() {
    this.rings.forEach(ring => {
      ring.angle += ring.speed * config.accretionSpeed * 0.01;
      if (ring.angle > Math.PI * 2) ring.angle -= Math.PI * 2;
    });
  }

  draw() {
    this.rings.forEach((ring, index) => {
      const gradient = ctx.createRadialGradient(
        centerX, centerY, ring.radius - 10,
        centerX, centerY, ring.radius + 10
      );

      // Cores quentes no interior, frias no exterior
      const temp = 1 - (index / this.numRings);
      const hue = 280 - temp * 80; // De azul a laranja

      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 100%, 60%, ${ring.opacity})`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = ring.thickness;
      ctx.stroke();

      // Adicionar brilho
      ctx.shadowBlur = 20;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${ring.opacity * 0.5})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }
}

let accretionDisk = new AccretionDisk();

// Buraco Negro (Event Horizon)
function drawBlackHole() {
  // Event Horizon (preto absoluto)
  const horizonGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, config.eventHorizon
  );

  horizonGradient.addColorStop(0, '#000000');
  horizonGradient.addColorStop(0.7, '#000000');
  horizonGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, config.eventHorizon, 0, Math.PI * 2);
  ctx.fillStyle = horizonGradient;
  ctx.fill();

  // Photon Sphere (anel de luz)
  const photonRadius = config.schwarzschildRadius * 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, photonRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 30;
  ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// Lente Gravitacional
function applyGravitationalLensing() {
  if (config.lensStrength === 0) return;

  const lensRadius = config.eventHorizon * 3;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(imageData, 0, 0);

  ctx.clearRect(0, 0, width, height);

  const strength = config.lensStrength / 100;

  for (let y = Math.max(0, centerY - lensRadius); y < Math.min(height, centerY + lensRadius); y += 2) {
    for (let x = Math.max(0, centerX - lensRadius); x < Math.min(width, centerX + lensRadius); x += 2) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < lensRadius && dist > config.eventHorizon) {
        const factor = strength * (lensRadius - dist) / lensRadius;
        const angle = Math.atan2(dy, dx);
        const distortion = factor * 50;

        const sourceX = x + Math.cos(angle) * distortion;
        const sourceY = y + Math.sin(angle) * distortion;

        if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
          const pixel = tempCtx.getImageData(sourceX, sourceY, 1, 1);
          ctx.putImageData(pixel, x, y);
        }
      } else {
        const pixel = tempCtx.getImageData(x, y, 1, 1);
        ctx.putImageData(pixel, x, y);
      }
    }
  }
}

// Background com estrelas
class Star {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.5;
    this.brightness = Math.random();
    this.twinkleSpeed = Math.random() * 0.02 + 0.01;
  }

  draw() {
    this.brightness += this.twinkleSpeed;
    if (this.brightness > 1 || this.brightness < 0) {
      this.twinkleSpeed *= -1;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness * 0.8})`;
    ctx.fill();
  }
}

let stars = [];
function initStars() {
  stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
}

// Distorção do Background
function drawDistortedBackground() {
  if (!config.distortionEnabled) return;

  const gridSize = 50;
  const distortionRadius = config.eventHorizon * 2.5;

  ctx.strokeStyle = 'rgba(138, 43, 226, 0.1)';
  ctx.lineWidth = 1;

  // Grid distorcido
  for (let i = 0; i < width; i += gridSize) {
    ctx.beginPath();
    for (let j = 0; j < height; j += 5) {
      const dx = i - centerX;
      const dy = j - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let x = i;
      if (dist < distortionRadius) {
        const factor = (distortionRadius - dist) / distortionRadius;
        const angle = Math.atan2(dy, dx);
        x += Math.cos(angle) * factor * 30;
      }

      if (j === 0) {
        ctx.moveTo(x, j);
      } else {
        ctx.lineTo(x, j);
      }
    }
    ctx.stroke();
  }

  for (let j = 0; j < height; j += gridSize) {
    ctx.beginPath();
    for (let i = 0; i < width; i += 5) {
      const dx = i - centerX;
      const dy = j - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let y = j;
      if (dist < distortionRadius) {
        const factor = (distortionRadius - dist) / distortionRadius;
        const angle = Math.atan2(dy, dx);
        y += Math.sin(angle) * factor * 30;
      }

      if (i === 0) {
        ctx.moveTo(i, y);
      } else {
        ctx.lineTo(i, y);
      }
    }
    ctx.stroke();
  }
}

// FPS Counter
let fps = 0;
let frameCount = 0;
let lastTime = performance.now();

function updateFPS() {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime - lastTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastTime = currentTime;
    document.getElementById('fps').textContent = fps;
  }
}

// Loop de Animação
function animate() {
  // Limpar canvas
  ctx.fillStyle = 'rgba(0, 0, 10, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // Desenhar estrelas de fundo
  stars.forEach(star => star.draw());

  // Desenhar distorção do background
  drawDistortedBackground();

  // Atualizar e desenhar disco de acreção
  accretionDisk.update();
  accretionDisk.draw();

  // Atualizar e desenhar partículas
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  // Desenhar buraco negro
  drawBlackHole();

  // Aplicar lente gravitacional (cuidado: pode ser pesado)
  // Descomente se quiser ativar a lente gravitacional real
  // applyGravitationalLensing();

  // Atualizar contador de partículas
  document.getElementById('particleCounter').textContent = particles.length;

  // Atualizar FPS
  updateFPS();

  requestAnimationFrame(animate);
}

// Controles
function setupControls() {
  const massSlider = document.getElementById('massSlider');
  const massValue = document.getElementById('massValue');
  massSlider.addEventListener('input', (e) => {
    config.blackHoleMass = parseFloat(e.target.value);
    config.eventHorizon = 80 * (config.blackHoleMass / 150);
    config.schwarzschildRadius = 60 * (config.blackHoleMass / 150);
    massValue.textContent = e.target.value;
    accretionDisk = new AccretionDisk(); // Recria o disco
  });

  const particleCount = document.getElementById('particleCount');
  const particleValue = document.getElementById('particleValue');
  particleCount.addEventListener('input', (e) => {
    const newCount = parseInt(e.target.value);
    config.particleCount = newCount;
    particleValue.textContent = newCount;

    // Ajustar número de partículas
    if (particles.length < newCount) {
      for (let i = particles.length; i < newCount; i++) {
        particles.push(new Particle());
      }
    } else {
      particles = particles.slice(0, newCount);
    }
  });

  const gravityStrength = document.getElementById('gravityStrength');
  const gravityValue = document.getElementById('gravityValue');
  gravityStrength.addEventListener('input', (e) => {
    config.gravityStrength = parseFloat(e.target.value);
    gravityValue.textContent = e.target.value;
  });

  const lensStrength = document.getElementById('lensStrength');
  const lensValue = document.getElementById('lensValue');
  lensStrength.addEventListener('input', (e) => {
    config.lensStrength = parseFloat(e.target.value);
    lensValue.textContent = e.target.value;
  });

  const accretionSpeed = document.getElementById('accretionSpeed');
  const accretionValue = document.getElementById('accretionValue');
  accretionSpeed.addEventListener('input', (e) => {
    config.accretionSpeed = parseFloat(e.target.value);
    accretionValue.textContent = e.target.value;
  });

  const distortionToggle = document.getElementById('distortionToggle');
  distortionToggle.addEventListener('change', (e) => {
    config.distortionEnabled = e.target.checked;
  });

  const infiniteZoom = document.getElementById('infiniteZoom');
  infiniteZoom.addEventListener('change', (e) => {
    config.infiniteZoom = e.target.checked;
  });

  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    config = {
      blackHoleMass: 150,
      particleCount: 2000,
      gravityStrength: 500,
      lensStrength: 50,
      accretionSpeed: 5,
      distortionEnabled: true,
      infiniteZoom: true,
      eventHorizon: 80,
      schwarzschildRadius: 60
    };

    massSlider.value = 150;
    massValue.textContent = '150';
    particleCount.value = 2000;
    particleValue.textContent = '2000';
    gravityStrength.value = 500;
    gravityValue.textContent = '500';
    lensStrength.value = 50;
    lensValue.textContent = '50';
    accretionSpeed.value = 5;
    accretionValue.textContent = '5';
    distortionToggle.checked = true;
    infiniteZoom.checked = true;

    initParticles();
    accretionDisk = new AccretionDisk();
  });

  // Toggle controles
  const toggleBtn = document.getElementById('toggleControls');
  const controlPanel = document.querySelector('.control-panel');
  let controlsVisible = true;

  toggleBtn.addEventListener('click', () => {
    controlsVisible = !controlsVisible;
    if (controlsVisible) {
      controlPanel.classList.remove('hidden');
    } else {
      controlPanel.classList.add('hidden');
    }
  });
}

// Inicialização
function init() {
  initStars();
  initParticles();
  setupControls();
  animate();
}

// Iniciar quando a página carregar
window.addEventListener('load', init);
