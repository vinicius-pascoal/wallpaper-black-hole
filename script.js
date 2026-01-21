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
  particleCount: 300,
  gravityStrength: 500,
  lensStrength: 50,
  accretionSpeed: 5,
  distortionEnabled: true,
  infiniteZoom: true,
  eventHorizon: 80,
  schwarzschildRadius: 60,
  // Novos recursos avançados
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

    // Reciclagem de partículas fora da tela (não cria novas, apenas reposiciona)
    if (config.infiniteZoom) {
      if (this.x < -100 || this.x > width + 100 ||
        this.y < -100 || this.y > height + 100) {
        this.respawn();
        this.life = 1.0;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
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

    // Efeito de redshift gravitacional (mais pronunciado)
    const redshift = Math.max(0, 1 - dist / 600);
    const hue = this.hue + redshift * 80;

    // Efeito de spaghettification - partículas esticam perto do buraco negro
    const stretchFactor = Math.max(1, 5 / (dist / 20));
    const angle = Math.atan2(dy, dx);

    // Desenhar trail (rastro)
    if (dist < 400) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.4})`;
      ctx.lineWidth = this.size * 0.5;
      ctx.stroke();
    }

    // Desenhar partícula com elongação
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * stretchFactor, this.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;

    // Glow effect para partículas próximas
    if (dist < 300) {
      ctx.shadowBlur = 15 * intensity;
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${alpha * 0.8})`;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
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
    this.numRings = 8;
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
        centerX, centerY, ring.radius - 15,
        centerX, centerY, ring.radius + 15
      );

      // Cores quentes no interior, frias no exterior (mais saturado)
      const temp = 1 - (index / this.numRings);
      const hue = 280 - temp * 100; // De azul a vermelho
      const saturation = 100;
      const lightness = 40 + temp * 30;

      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);
      gradient.addColorStop(0.3, `hsla(${hue}, ${saturation}%, ${lightness + 10}%, ${ring.opacity * 0.6})`);
      gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, ${ring.opacity})`);
      gradient.addColorStop(0.7, `hsla(${hue}, ${saturation}%, ${lightness + 10}%, ${ring.opacity * 0.6})`);
      gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = ring.thickness;
      ctx.stroke();

      // Adicionar brilho intenso
      ctx.shadowBlur = 30 * temp;
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${ring.opacity * 0.7})`;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Adicionar hotspots (pontos quentes) no disco
      if (index < this.numRings / 2) {
        const numHotspots = 3 + Math.floor(Math.random() * 3);
        for (let h = 0; h < numHotspots; h++) {
          const hotspotAngle = ring.angle + (h * Math.PI * 2 / numHotspots);
          const hotspotX = centerX + Math.cos(hotspotAngle) * ring.radius;
          const hotspotY = centerY + Math.sin(hotspotAngle) * ring.radius;

          const hotspotGradient = ctx.createRadialGradient(
            hotspotX, hotspotY, 0,
            hotspotX, hotspotY, 8
          );
          hotspotGradient.addColorStop(0, `hsla(${hue - 20}, 100%, 80%, ${ring.opacity * 0.8})`);
          hotspotGradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`);

          ctx.beginPath();
          ctx.arc(hotspotX, hotspotY, 8, 0, Math.PI * 2);
          ctx.fillStyle = hotspotGradient;
          ctx.shadowBlur = 15;
          ctx.shadowColor = `hsla(${hue - 20}, 100%, 70%, ${ring.opacity})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    });
  }
}

let accretionDisk = new AccretionDisk();

// Ergosfera (região onde o espaço-tempo é arrastado)
function drawErgosphere() {
  if (!config.ergosphere) return;

  const ergosphereRadius = config.eventHorizon * 1.2;

  // Anel da ergosfera com pulsação
  const pulse = Math.sin(Date.now() * 0.002) * 0.1 + 0.9;

  const ergosphereGradient = ctx.createRadialGradient(
    centerX, centerY, ergosphereRadius - 10,
    centerX, centerY, ergosphereRadius + 10
  );

  ergosphereGradient.addColorStop(0, `rgba(100, 50, 200, ${0.15 * pulse})`);
  ergosphereGradient.addColorStop(0.5, `rgba(150, 100, 255, ${0.25 * pulse})`);
  ergosphereGradient.addColorStop(1, `rgba(100, 50, 200, ${0.1 * pulse})`);

  ctx.beginPath();
  ctx.arc(centerX, centerY, ergosphereRadius, 0, Math.PI * 2);
  ctx.strokeStyle = ergosphereGradient;
  ctx.lineWidth = 8;
  ctx.shadowBlur = 20 * pulse;
  ctx.shadowColor = 'rgba(150, 100, 255, 0.5)';
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// Jatos Relativísticos (Relativistic Jets)
class RelativisticJet {
  constructor() {
    this.particles = [];
    this.maxParticles = 50;
    this.angle = 0;
  }

  update() {
    // Criar novas partículas nos polos
    if (this.particles.length < this.maxParticles && Math.random() < 0.3) {
      // Jato superior
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 2,
        vy: -5 - Math.random() * 5,
        life: 1.0,
        size: Math.random() * 3 + 1,
        hue: 180 + Math.random() * 40
      });

      // Jato inferior
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 2,
        vy: 5 + Math.random() * 5,
        life: 1.0,
        size: Math.random() * 3 + 1,
        hue: 180 + Math.random() * 40
      });
    }

    // Atualizar partículas dos jatos
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy *= 0.99; // Leve desaceleração
      p.life -= 0.01;
      return p.life > 0 && p.y > -100 && p.y < height + 100;
    });
  }

  draw() {
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life * 0.8})`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${p.life})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Trail do jato
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
      ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, ${p.life * 0.3})`;
      ctx.lineWidth = p.size * 0.5;
      ctx.stroke();
    });
  }
}

let relativisticJets = new RelativisticJet();

// Radiação Hawking (partículas quânticas sendo emitidas)
class HawkingRadiation {
  constructor() {
    this.particles = [];
    this.maxParticles = 30;
  }

  update() {
    // Criar novas partículas no horizonte de eventos
    if (this.particles.length < this.maxParticles && Math.random() < 0.2) {
      const angle = Math.random() * Math.PI * 2;
      const radius = config.eventHorizon;

      this.particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        life: 1.0,
        size: Math.random() * 1.5 + 0.5,
        hue: Math.random() * 360
      });
    }

    // Atualizar partículas
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.015;
      return p.life > 0;
    });
  }

  draw() {
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life * 0.6})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 80%, ${p.life})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
}

let hawkingRadiation = new HawkingRadiation();

// Frame Dragging (arrasto do espaço-tempo)
function drawFrameDragging() {
  if (!config.frameDragging) return;

  const time = Date.now() * 0.0005;
  const numSpirals = 8;
  const maxRadius = config.eventHorizon * 2;

  for (let i = 0; i < numSpirals; i++) {
    const baseAngle = (i / numSpirals) * Math.PI * 2 + time;

    ctx.beginPath();
    for (let r = config.eventHorizon; r < maxRadius; r += 5) {
      const spiralTightness = 0.05;
      const angle = baseAngle + (maxRadius - r) * spiralTightness;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (r === config.eventHorizon) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    const opacity = 0.1 * (1 - (i / numSpirals) * 0.5);
    ctx.strokeStyle = `rgba(200, 150, 255, ${opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// Time Dilation Effect (efeito visual de dilatação temporal)
function applyTimeDilation() {
  if (!config.timeDilation) return;

  // Criar efeito de distorção temporal próximo ao horizonte
  const distortionRadius = config.eventHorizon * 1.8;

  const gradient = ctx.createRadialGradient(
    centerX, centerY, config.eventHorizon,
    centerX, centerY, distortionRadius
  );

  const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;

  gradient.addColorStop(0, `rgba(100, 200, 255, ${0.05 * pulse})`);
  gradient.addColorStop(0.5, `rgba(150, 150, 255, ${0.03 * pulse})`);
  gradient.addColorStop(1, 'rgba(100, 100, 200, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Buraco Negro (Event Horizon)
function drawBlackHole() {
  // Sombra profunda externa - baseada na observação do M87
  const shadowRadius = config.eventHorizon * 2.6; // Baseado na razão real de sombra/horizonte
  const outerShadow = ctx.createRadialGradient(
    centerX, centerY, config.eventHorizon * 0.5,
    centerX, centerY, shadowRadius
  );
  outerShadow.addColorStop(0, 'rgba(0, 0, 0, 1)');
  outerShadow.addColorStop(0.4, 'rgba(0, 0, 0, 0.98)');
  outerShadow.addColorStop(0.7, 'rgba(2, 0, 5, 0.8)');
  outerShadow.addColorStop(0.85, 'rgba(5, 2, 10, 0.4)');
  outerShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, shadowRadius, 0, Math.PI * 2);
  ctx.fillStyle = outerShadow;
  ctx.fill();

  // Photon Sphere - anel de luz baseado em simulações reais
  const photonRadius = config.schwarzschildRadius * 1.5;
  const time = Date.now() * 0.001;

  // Einstein Ring (anel secundário de lensing)
  const einsteinRingRadius = photonRadius * 1.4;
  for (let i = 0; i < 3; i++) {
    const offset = i * 3;
    const opacity = (3 - i) * 0.08;
    ctx.beginPath();
    ctx.arc(centerX, centerY, einsteinRingRadius + offset, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 220, 180, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(255, 220, 180, ${opacity * 0.6})`;
    ctx.stroke();
  }

  // Photon Sphere - camada externa difusa
  ctx.beginPath();
  ctx.arc(centerX, centerY, photonRadius + 12, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 200, 140, 0.12)';
  ctx.lineWidth = 8;
  ctx.shadowBlur = 30;
  ctx.shadowColor = 'rgba(255, 200, 140, 0.3)';
  ctx.stroke();

  // Photon Sphere - anel principal (mais brilhante)
  ctx.beginPath();
  ctx.arc(centerX, centerY, photonRadius, 0, Math.PI * 2);
  const mainPhotonGradient = ctx.createRadialGradient(
    centerX, centerY, photonRadius - 2,
    centerX, centerY, photonRadius + 2
  );
  mainPhotonGradient.addColorStop(0, 'rgba(255, 240, 200, 0)');
  mainPhotonGradient.addColorStop(0.5, 'rgba(255, 230, 180, 0.7)');
  mainPhotonGradient.addColorStop(1, 'rgba(255, 200, 140, 0)');
  ctx.strokeStyle = mainPhotonGradient;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 45;
  ctx.shadowColor = 'rgba(255, 230, 180, 1)';
  ctx.stroke();

  // Photon Sphere - anel interno intenso
  ctx.beginPath();
  ctx.arc(centerX, centerY, photonRadius - 6, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 245, 220, 0.5)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 50;
  ctx.shadowColor = 'rgba(255, 245, 220, 0.9)';
  ctx.stroke();

  // Pulsos de luz realistas na photon sphere
  const pulseIntensity = Math.sin(time * 2) * 0.15 + 0.85;
  ctx.shadowBlur = 35 * pulseIntensity;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Event Horizon - preto absoluto com degradê mais realista
  const horizonGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, config.eventHorizon
  );

  horizonGradient.addColorStop(0, '#000000');
  horizonGradient.addColorStop(0.7, '#000000');
  horizonGradient.addColorStop(0.88, 'rgba(1, 0, 2, 0.95)');
  horizonGradient.addColorStop(0.96, 'rgba(3, 1, 5, 0.6)');
  horizonGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, config.eventHorizon, 0, Math.PI * 2);
  ctx.fillStyle = horizonGradient;
  ctx.fill();

  // Singularidade - centro absoluto
  const singularityRadius = config.schwarzschildRadius * 0.2;
  const singularityGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, singularityRadius
  );
  singularityGradient.addColorStop(0, '#000000');
  singularityGradient.addColorStop(1, '#000000');

  ctx.beginPath();
  ctx.arc(centerX, centerY, singularityRadius, 0, Math.PI * 2);
  ctx.fillStyle = singularityGradient;
  ctx.fill();

  // Efeito de distorção óptica sutil no horizonte
  const distortionGradient = ctx.createRadialGradient(
    centerX, centerY, config.eventHorizon * 0.95,
    centerX, centerY, config.eventHorizon * 1.05
  );
  distortionGradient.addColorStop(0, 'rgba(10, 5, 15, 0)');
  distortionGradient.addColorStop(0.5, 'rgba(15, 8, 20, 0.15)');
  distortionGradient.addColorStop(1, 'rgba(10, 5, 15, 0)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, config.eventHorizon, 0, Math.PI * 2);
  ctx.strokeStyle = distortionGradient;
  ctx.lineWidth = 3;
  ctx.stroke();
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
  for (let i = 0; i < 400; i++) {
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

// Nebulosa de fundo
function drawNebula() {
  const nebulaGradient = ctx.createRadialGradient(
    centerX, centerY, config.eventHorizon * 2,
    centerX, centerY, Math.max(width, height) * 0.8
  );

  nebulaGradient.addColorStop(0, 'rgba(138, 43, 226, 0.03)');
  nebulaGradient.addColorStop(0.3, 'rgba(75, 0, 130, 0.02)');
  nebulaGradient.addColorStop(0.6, 'rgba(25, 25, 112, 0.015)');
  nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = nebulaGradient;
  ctx.fillRect(0, 0, width, height);
}

// Loop de Animação
function animate() {
  // Limpar canvas com trail effect
  ctx.fillStyle = 'rgba(0, 0, 10, 0.15)';
  ctx.fillRect(0, 0, width, height);

  // Desenhar nebulosa de fundo
  drawNebula();

  // Desenhar estrelas de fundo
  stars.forEach(star => star.draw());

  // Desenhar distorção do background
  drawDistortedBackground();

  // Frame Dragging (antes do disco)
  if (config.frameDragging) {
    drawFrameDragging();
  }

  // Atualizar e desenhar disco de acreção
  accretionDisk.update();
  accretionDisk.draw();

  // Ergosfera
  if (config.ergosphere) {
    drawErgosphere();
  }

  // Atualizar e desenhar partículas
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  // Jatos Relativísticos
  if (config.relativisticJets) {
    relativisticJets.update();
    relativisticJets.draw();
  }

  // Radiação Hawking
  if (config.hawkingRadiation) {
    hawkingRadiation.update();
    hawkingRadiation.draw();
  }

  // Time Dilation Effect
  if (config.timeDilation) {
    applyTimeDilation();
  }

  // Desenhar buraco negro (por último para ficar na frente)
  drawBlackHole();

  // Aplicar lente gravitacional (cuidado: pode ser pesado)
  // Descomente se quiser ativar a lente gravitacional real
  // applyGravitationalLensing();

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

  // Novos controles para efeitos avançados
  const relativisticJetsToggle = document.getElementById('relativisticJets');
  relativisticJetsToggle.addEventListener('change', (e) => {
    config.relativisticJets = e.target.checked;
  });

  const hawkingRadiationToggle = document.getElementById('hawkingRadiation');
  hawkingRadiationToggle.addEventListener('change', (e) => {
    config.hawkingRadiation = e.target.checked;
  });

  const ergosphereToggle = document.getElementById('ergosphere');
  ergosphereToggle.addEventListener('change', (e) => {
    config.ergosphere = e.target.checked;
  });

  const frameDraggingToggle = document.getElementById('frameDragging');
  frameDraggingToggle.addEventListener('change', (e) => {
    config.frameDragging = e.target.checked;
  });

  const timeDilationToggle = document.getElementById('timeDilation');
  timeDilationToggle.addEventListener('change', (e) => {
    config.timeDilation = e.target.checked;
  });

  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    config = {
      blackHoleMass: 150,
      particleCount: 300,
      gravityStrength: 500,
      lensStrength: 50,
      accretionSpeed: 5,
      distortionEnabled: true,
      infiniteZoom: true,
      eventHorizon: 80,
      schwarzschildRadius: 60,
      relativisticJets: true,
      hawkingRadiation: true,
      ergosphere: true,
      frameDragging: true,
      timeDilation: true
    };

    massSlider.value = 150;
    massValue.textContent = '150';
    particleCount.value = 300;
    particleValue.textContent = '300';
    gravityStrength.value = 500;
    gravityValue.textContent = '500';
    lensStrength.value = 50;
    lensValue.textContent = '50';
    accretionSpeed.value = 5;
    accretionValue.textContent = '5';
    distortionToggle.checked = true;
    infiniteZoom.checked = true;
    relativisticJetsToggle.checked = true;
    hawkingRadiationToggle.checked = true;
    ergosphereToggle.checked = true;
    frameDraggingToggle.checked = true;
    timeDilationToggle.checked = true;

    initParticles();
    accretionDisk = new AccretionDisk();
  });

  // Toggle controles (travar/destravar o painel)
  const toggleBtn = document.getElementById('toggleControls');
  const controlPanel = document.querySelector('.control-panel');
  const controls = document.querySelector('.controls');
  let controlsLocked = false;

  // Inicialmente escondido
  controlPanel.classList.add('hidden');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    controlsLocked = !controlsLocked;

    if (controlsLocked) {
      // Travar aberto
      controlPanel.classList.remove('hidden');
      toggleBtn.classList.add('locked');
      toggleBtn.textContent = '🔒';
      toggleBtn.title = 'Clique para destravar';
    } else {
      // Destravar - esconde se o mouse não estiver sobre os controles
      const isHovering = controls.matches(':hover');
      if (!isHovering) {
        controlPanel.classList.add('hidden');
      }
      toggleBtn.classList.remove('locked');
      toggleBtn.textContent = '⚙️';
      toggleBtn.title = 'Clique para travar aberto';
    }
  });

  // Remover classe hidden ao passar o mouse (se não estiver travado)
  controls.addEventListener('mouseenter', () => {
    if (!controlsLocked) {
      controlPanel.classList.remove('hidden');
    }
  });

  // Adicionar classe hidden ao sair o mouse (se não estiver travado)
  controls.addEventListener('mouseleave', () => {
    if (!controlsLocked) {
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
