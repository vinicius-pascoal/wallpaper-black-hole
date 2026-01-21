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
let webglLens = null;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;

  if (webglLens) {
    webglLens.resize(width, height);
  }
}

// Config
let config = {
  currentPreset: 'custom',
  blackHoleMass: 150,
  particleCount: 50,
  gravityStrength: 500,
  lensStrength: 50,
  accretionSpeed: 5,
  infiniteZoom: true,
  glslLens: false,
  eventHorizon: 80,
  schwarzschildRadius: 60,
  relativisticJets: false,
  hawkingRadiation: false,
  ergosphere: false,
  frameDragging: false,
  retroMode: false,
  nebulaBackground: true,
  schrodingerMode: false
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

// Easter Egg: Gato de Schrödinger - Partícula Especial
class SchrodingerParticle extends Particle {
  constructor() {
    super();
    this.exists = Math.random() > 0.5;
    this.existenceTimer = 0;
    this.existenceCycle = Math.random() * 1000 + 500; // Ciclo entre 0.5s e 1.5s
    this.isSchrodinger = true;
  }

  draw() {
    if (!this.exists) {
      // Desenhar apenas um fantasma quando a partícula não existe
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      ctx.save();
      ctx.globalAlpha = 0.2;
      super.draw();
      ctx.restore();
      return;
    }

    super.draw();
  }

  update() {
    // Alterna entre existência e não-existência
    this.existenceTimer = (this.existenceTimer + 1) % this.existenceCycle;
    this.exists = this.existenceTimer < this.existenceCycle * 0.7;

    if (this.exists) {
      super.update();
    }
  }
}

// Disco de Acreção - Estilo Interstellar/M87
class AccretionDisk {
  constructor() {
    this.rings = 25;
    this.particles = [];
    this.hotspots = [];

    for (let i = 0; i < 8; i++) {
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

  drawEllipticalRing(innerRadius, outerRadius, ring, totalRings, time, verticalSign) {
    const t = ring / totalRings;
    const radius = innerRadius + (outerRadius - innerRadius) * t;
    const nextRadius = innerRadius + (outerRadius - innerRadius) * ((ring + 1) / totalRings);

    const temperature = 1 - t;

    // Achatamento extremo do disco (perspectiva elíptica)
    const flatteningRatio = 0.18;
    const verticalRadius = radius * flatteningRatio;
    const nextVerticalRadius = nextRadius * flatteningRatio;

    // Offset vertical para separar disco superior/inferior
    const verticalOffset = verticalSign * config.schwarzschildRadius * 0.3;

    // Cores laranja/vermelho intenso estilo M87
    let r, g, b, opacity;
    if (temperature > 0.7) {
      r = 255;
      g = 200 + temperature * 55;
      b = 100 + temperature * 50;
      opacity = (0.7 + temperature * 0.3) * (verticalSign > 0 ? 0.6 : 1.0);
    } else if (temperature > 0.4) {
      r = 255;
      g = 140 + temperature * 60;
      b = 30 + temperature * 50;
      opacity = (0.6 + temperature * 0.3) * (verticalSign > 0 ? 0.5 : 0.9);
    } else {
      r = 200 + temperature * 55;
      g = 50 + temperature * 50;
      b = 10 + temperature * 20;
      opacity = (0.4 + temperature * 0.3) * (verticalSign > 0 ? 0.4 : 0.7);
    }

    ctx.save();
    ctx.translate(centerX, centerY + verticalOffset);

    // Desenhar anel elíptico
    ctx.beginPath();
    ctx.ellipse(0, 0, nextRadius, nextVerticalRadius, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, radius, verticalRadius, 0, 0, Math.PI * 2, true);

    const gradient = ctx.createRadialGradient(0, 0, radius, 0, 0, nextRadius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${opacity * 0.9})`);
    gradient.addColorStop(1, `rgba(${r * 0.8}, ${g * 0.8}, ${b * 0.8}, ${opacity * 0.5})`);

    ctx.fillStyle = gradient;
    ctx.fill();

    // Borda brilhante
    if (temperature > 0.5) {
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, verticalRadius, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, ${200 + temperature * 55}, ${100 + temperature * 50}, ${opacity * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Hotspots rotativos
    if (ring % 2 === 0) {
      this.hotspots.forEach((hotspot, idx) => {
        const angle = hotspot.angle + (ring * 0.1) + time * config.accretionSpeed * 0.1;
        const hotspotRadius = (radius + nextRadius) / 2;
        const x = Math.cos(angle) * hotspotRadius;
        const y = Math.sin(angle) * hotspotRadius * flatteningRatio;

        const hotspotSize = (10 + hotspot.intensity * 15) * temperature;
        const hotspotGradient = ctx.createRadialGradient(x, y, 0, x, y, hotspotSize);

        hotspotGradient.addColorStop(0, `rgba(255, 255, 200, ${0.9 * temperature})`);
        hotspotGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.6 * temperature})`);
        hotspotGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = hotspotGradient;
        ctx.beginPath();
        ctx.ellipse(x, y, hotspotSize, hotspotSize * flatteningRatio, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  draw() {
    const innerRadius = config.schwarzschildRadius * 1.5;
    const outerRadius = config.schwarzschildRadius * 4;
    const time = Date.now() * 0.001;

    // Desenhar disco achatado superior (visível acima)
    for (let ring = 0; ring < this.rings; ring++) {
      this.drawEllipticalRing(innerRadius, outerRadius, ring, this.rings, time, -1);
    }

    // Desenhar disco achatado inferior (efeito de dobra gravitacional)
    for (let ring = 0; ring < this.rings; ring++) {
      this.drawEllipticalRing(innerRadius, outerRadius, ring, this.rings, time, 1);
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

// Neblosa de Fundo - Galáxias e Nebulosas
class NebulaBackground {
  constructor() {
    this.nebulas = [];
    this.generateNebulas();
  }

  generateNebulas() {
    // Criar várias manchas nebulosas com cores diferentes
    for (let i = 0; i < 5; i++) {
      this.nebulas.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 200 + 150,
        hue: Math.random() * 60 + 200, // Azul a roxo
        intensity: Math.random() * 0.3 + 0.2,
        rotation: Math.random() * Math.PI * 2
      });
    }
  }

  draw() {
    // Desenhar nebulosas
    this.nebulas.forEach(nebula => {
      const gradient = ctx.createRadialGradient(
        nebula.x, nebula.y, 0,
        nebula.x, nebula.y, nebula.radius
      );

      const hsl = `hsl(${nebula.hue}, 70%, 50%)`;
      gradient.addColorStop(0, `rgba(${this.hslToRgb(nebula.hue, 70, 50).join(',')}, ${nebula.intensity * 0.6})`);
      gradient.addColorStop(0.5, `rgba(${this.hslToRgb(nebula.hue, 70, 50).join(',')}, ${nebula.intensity * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }

  hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
}

// Background com estrelas (versão sutil)
function drawStarField() {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.twinkle = (star.twinkle + 0.02) % (Math.PI * 2);
    const opacity = 0.2 + Math.sin(star.twinkle) * 0.15;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * 0.8, 0, Math.PI * 2);
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
let nebula;

function initScene() {
  // Neblosa de fundo
  nebula = new NebulaBackground();

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
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  // Clear com fundo mais escuro
  const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width);
  bgGradient.addColorStop(0, 'rgba(5, 5, 8, 0.3)');
  bgGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
  bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Neblosa de fundo
  if (config.nebulaBackground && nebula) {
    nebula.draw();
  }

  // Stars (mais sutis)
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

  // Aplicar lente gravitacional WebGL se habilitado
  if (config.glslLens && webglLens) {
    webglLens.render(config, time);
  }
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

  document.getElementById('infiniteZoom').addEventListener('change', (e) => {
    config.infiniteZoom = e.target.checked;
  });

  document.getElementById('glslLens').addEventListener('change', (e) => {
    config.glslLens = e.target.checked;

    if (!webglLens) {
      console.log('Inicializando WebGL Lens...');
      webglLens = new window.WebGLLens('webglCanvas');
      if (!webglLens.gl) {
        alert('WebGL não disponível no seu navegador. Use um navegador moderno.');
        config.glslLens = false;
        e.target.checked = false;
        return;
      }
      webglLens.resize(width, height);
    }

    if (config.glslLens) {
      webglLens.enable();
    } else {
      webglLens.disable();
    }
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

  document.getElementById('nebulaBackground').addEventListener('change', (e) => {
    config.nebulaBackground = e.target.checked;
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    location.reload();
  });

  // ===== INPUT ESCONDIDO PARA EASTER EGGS =====
  const secretInput = document.getElementById('secretInput');

  secretInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = secretInput.value.toLowerCase().trim();

      if (command === '42') {
        handleEasterEgg42();
        secretInput.value = '';
        secretInput.blur();
      } else if (command === 'retro' || command === 'retromodo') {
        toggleRetroMode();
        secretInput.value = '';
        secretInput.blur();
      } else if (command === 'nyan') {
        handleNyanCat();
        secretInput.value = '';
        secretInput.blur();
      } else if (command === 'tardis') {
        handleTardis();
        secretInput.value = '';
        secretInput.blur();
      } else if (command === 'matrix') {
        handleMatrix();
        secretInput.value = '';
        secretInput.blur();
      } else if (command === 'help' || command === 'ajuda') {
        showSecretHelp();
        secretInput.value = '';
      }
    }
  });

  // Limpar input ao perder foco
  secretInput.addEventListener('blur', () => {
    secretInput.value = '';
  });
}

// Easter Egg 42 - A Resposta para Tudo
function handleEasterEgg42() {
  console.log('🎯 A TOALHA está sendo sugada para o buraco negro!');

  // Criar container para a toalha
  const towelContainer = document.createElement('div');
  towelContainer.id = 'towel42';
  towelContainer.style.cssText = `
    position: fixed;
    top: 10%;
    left: 50%;
    width: 250px;
    height: 250px;
    transform: translate(-50%, -50%) rotate(0deg);
    z-index: 9999;
    pointer-events: none;
    animation: towelSucked 2s ease-in forwards;
  `;

  // Criar imagem da toalha
  const towelImg = document.createElement('img');
  towelImg.src = 'imgs/toalha.png';
  towelImg.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
  `;
  towelImg.onerror = () => console.error('Erro ao carregar toalha.png');

  towelContainer.appendChild(towelImg);
  document.body.appendChild(towelContainer);

  // Adicionar estilos de animação
  if (!document.getElementById('towel42Style')) {
    const style = document.createElement('style');
    style.id = 'towel42Style';
    style.textContent = `
      @keyframes towelSucked {
        0% {
          top: 10%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(0deg) scale(1);
          opacity: 1;
        }
        100% {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(1080deg) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Remover elemento após animação
  setTimeout(() => {
    const towel = document.getElementById('towel42');
    if (towel) towel.remove();
  }, 2000);

  // Efeito visual no buraco negro
  config.lensStrength = Math.min(100, config.lensStrength + 40);
  const originalGravity = config.gravityStrength;
  const originalMass = config.blackHoleMass;
  config.gravityStrength *= 1.5;
  config.blackHoleMass *= 1.2;

  setTimeout(() => {
    config.lensStrength = Math.max(0, config.lensStrength - 40);
    config.gravityStrength = originalGravity;
    config.blackHoleMass = originalMass;
  }, 2000);
}

// Easter Egg: Modo Retro - Visual Pixelado 8-bit
function toggleRetroMode() {
  config.retroMode = !config.retroMode;
  const canvas = document.getElementById('blackHoleCanvas');
  const webglCanvas = document.getElementById('webglCanvas');

  if (config.retroMode) {
    console.log('🎮 Modo Retro Ativado! 8-bit visual ativado!');

    // Aplicar efeito retro com resolução reduzida e renderização pixelada
    canvas.style.imageRendering = 'pixelated';
    canvas.style.pixelated = 'pixelated';
    canvas.style.webkitImageRendering = 'pixelated';
    canvas.style.msInterpolationMode = 'nearest-neighbor';

    if (webglCanvas) {
      webglCanvas.style.imageRendering = 'pixelated';
      webglCanvas.style.pixelated = 'pixelated';
    }

    // Aplicar classe retro ao corpo da página
    document.body.classList.add('retro-mode-active');

    // Notificação estilo terminal retro
    const notification = document.createElement('div');
    notification.id = 'retroNotification';
    notification.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: rgba(0, 0, 0, 0.98);
      color: #00ff00;
      padding: 20px 30px;
      border: 3px solid #00ff00;
      border-radius: 0px;
      font-size: 16px;
      z-index: 9998;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 10px #00ff00, inset 0 0 5px rgba(0, 255, 0, 0.3);
      animation: retroFlicker 0.15s infinite;
      font-weight: bold;
      letter-spacing: 2px;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(0, 255, 0, 0.2);
    `;
    notification.innerHTML = `
      <div style="margin-bottom: 8px; font-size: 12px;">▼ ▲ ▼ ▲ ▼ ▲ ▼ ▲ ▼</div>
      > RETRO MODE: ON<br/>
      > 8-BIT ACTIVATED
      <div style="margin-top: 8px; font-size: 12px;">▲ ▼ ▲ ▼ ▲ ▼ ▲ ▼ ▲</div>
    `;
    document.body.appendChild(notification);

    // Adicionar estilos retro
    if (!document.getElementById('retroModeStyle')) {
      const style = document.createElement('style');
      style.id = 'retroModeStyle';
      style.textContent = `
        @keyframes retroFlicker {
          0% { opacity: 1; text-shadow: 0 0 10px #00ff00, inset 0 0 5px rgba(0, 255, 0, 0.3); }
          50% { opacity: 0.95; text-shadow: 0 0 15px #00ff00, 0 0 25px #00ff00, inset 0 0 10px rgba(0, 255, 0, 0.5); }
          100% { opacity: 1; text-shadow: 0 0 10px #00ff00, inset 0 0 5px rgba(0, 255, 0, 0.3); }
        }
        .retro-mode-active {
          filter: none !important;
        }
        #blackHoleCanvas {
          image-rendering: pixelated !important;
          image-rendering: -moz-crisp-edges !important;
          image-rendering: crisp-edges !important;
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      const notif = document.getElementById('retroNotification');
      if (notif) notif.remove();
    }, 4000);
  } else {
    console.log('🎮 Modo Retro Desativado!');
    canvas.style.imageRendering = 'auto';
    canvas.style.pixelated = 'auto';
    canvas.style.webkitImageRendering = 'auto';
    canvas.style.msInterpolationMode = 'auto';

    if (webglCanvas) {
      webglCanvas.style.imageRendering = 'auto';
      webglCanvas.style.pixelated = 'auto';
    }

    document.body.classList.remove('retro-mode-active');

    const notif = document.getElementById('retroNotification');
    if (notif) notif.remove();
  }
}

// Função para exibir ajuda do input escondido
function showSecretHelp() {
  const helpText = `
    🔮 COMANDOS SECRETOS 🔮
    
    42        - A resposta para tudo! (toalha sucada)
    retro     - Ativa modo retro 8-bit
    nyan      - Nyan Cat orbita o buraco negro 🐱🌈
    tardis    - TARDIS do Doctor Who 📞
    matrix    - Modo Matrix com código caindo 💚
    ajuda     - Mostra esta mensagem
  `;

  const helpNotif = document.createElement('div');
  helpNotif.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: #00ff00;
    padding: 30px 40px;
    border: 3px solid rgba(138, 43, 226, 0.8);
    border-radius: 10px;
    font-family: 'Courier New', monospace;
    z-index: 10000;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 0 30px rgba(138, 43, 226, 0.6);
    animation: helpAppear 0.3s ease;
  `;

  helpNotif.innerHTML = helpText.replace(/\n/g, '<br/>');
  document.body.appendChild(helpNotif);

  // Adicionar animação
  if (!document.getElementById('helpStyle')) {
    const style = document.createElement('style');
    style.id = 'helpStyle';
    style.textContent = `
      @keyframes helpAppear {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => helpNotif.remove(), 4000);
}

// Easter Egg: Nyan Cat orbitando o buraco negro
function handleNyanCat() {
  console.log('🐱🌈 NYAN CAT chegou!');

  const nyanCat = document.createElement('div');
  nyanCat.id = 'nyanCat';
  nyanCat.style.cssText = `
    position: fixed;
    width: 150px;
    height: 90px;
    z-index: 9999;
    pointer-events: none;
    animation: nyanOrbit 5s linear infinite;
  `;

  const nyanImg = document.createElement('img');
  nyanImg.src = 'imgs/nyan-cat.gif';
  nyanImg.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
  `;
  nyanImg.onerror = () => console.error('Erro ao carregar nyan-cat.gif');

  nyanCat.appendChild(nyanImg);
  document.body.appendChild(nyanCat);

  // Adicionar animação de órbita
  if (!document.getElementById('nyanStyle')) {
    const style = document.createElement('style');
    style.id = 'nyanStyle';
    style.textContent = `
      @keyframes nyanOrbit {
        0% {
          left: calc(50% + 300px * cos(0deg));
          top: calc(50% + 300px * sin(0deg));
          transform: translate(-50%, -50%) rotate(0deg);
        }
        25% {
          left: calc(50% + 300px * cos(90deg));
          top: calc(50% + 300px * sin(90deg));
          transform: translate(-50%, -50%) rotate(90deg);
        }
        50% {
          left: calc(50% + 300px * cos(180deg));
          top: calc(50% + 300px * sin(180deg));
          transform: translate(-50%, -50%) rotate(180deg);
        }
        75% {
          left: calc(50% + 300px * cos(270deg));
          top: calc(50% + 300px * sin(270deg));
          transform: translate(-50%, -50%) rotate(270deg);
        }
        100% {
          left: calc(50% + 300px * cos(360deg));
          top: calc(50% + 300px * sin(360deg));
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Remover após 10 segundos
  setTimeout(() => {
    const nyan = document.getElementById('nyanCat');
    if (nyan) nyan.remove();
  }, 10000);
}

// Easter Egg: TARDIS - Buraco negro piscando
function handleTardis() {
  console.log('📞 TARDIS materialized!');

  const canvas = document.getElementById('blackHoleCanvas');
  const webglCanvas = document.getElementById('webglCanvas');

  // Som TARDIS notification
  const tardisNotif = document.createElement('div');
  tardisNotif.style.cssText = `
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 50, 150, 0.95);
    color: #fff;
    padding: 20px 40px;
    border: 3px solid #0088ff;
    border-radius: 10px;
    font-family: 'Courier New', monospace;
    font-size: 24px;
    z-index: 10000;
    text-align: center;
    box-shadow: 0 0 40px rgba(0, 136, 255, 0.8);
    animation: tardisAppear 0.5s ease;
  `;
  tardisNotif.innerHTML = '📞 TARDIS DETECTED<br/><span style="font-size: 14px;">Wibbly Wobbly Timey Wimey</span>';
  document.body.appendChild(tardisNotif);

  // Animação de piscar
  let blinkCount = 0;
  const blinkInterval = setInterval(() => {
    if (blinkCount >= 20) {
      clearInterval(blinkInterval);
      canvas.style.opacity = '1';
      if (webglCanvas) webglCanvas.style.opacity = '1';
      return;
    }

    const opacity = blinkCount % 2 === 0 ? '0.1' : '1';
    canvas.style.opacity = opacity;
    if (webglCanvas) webglCanvas.style.opacity = opacity;

    blinkCount++;
  }, 200);

  // Adicionar estilo
  if (!document.getElementById('tardisStyle')) {
    const style = document.createElement('style');
    style.id = 'tardisStyle';
    style.textContent = `
      @keyframes tardisAppear {
        0% { transform: translateX(-50%) scale(2); opacity: 0; }
        50% { transform: translateX(-50%) scale(0.5); opacity: 0.5; }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => tardisNotif.remove(), 5000);
}

// Easter Egg: Matrix - Código caindo
function handleMatrix() {
  console.log('💚 Welcome to the Matrix...');

  const matrixCanvas = document.createElement('canvas');
  matrixCanvas.id = 'matrixCanvas';
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  matrixCanvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9998;
    pointer-events: none;
  `;
  document.body.appendChild(matrixCanvas);

  const ctx = matrixCanvas.getContext('2d');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
  const fontSize = 14;
  const columns = matrixCanvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);

  // Notificação Matrix
  const matrixNotif = document.createElement('div');
  matrixNotif.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.95);
    color: #00ff00;
    padding: 20px 40px;
    border: 3px solid #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 20px;
    z-index: 10001;
    text-align: center;
    box-shadow: 0 0 40px rgba(0, 255, 0, 0.8);
    animation: matrixGlitch 0.1s infinite;
  `;
  matrixNotif.innerHTML = 'WAKE UP, NEO...<br/><span style="font-size: 12px;">The Matrix has you</span>';
  document.body.appendChild(matrixNotif);

  // Animação de código caindo
  const matrixInterval = setInterval(() => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 50);

  // Adicionar estilo de glitch
  if (!document.getElementById('matrixStyle')) {
    const style = document.createElement('style');
    style.id = 'matrixStyle';
    style.textContent = `
      @keyframes matrixGlitch {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        25% { transform: translateX(-48%) translateY(-2px); }
        75% { transform: translateX(-52%) translateY(2px); }
      }
    `;
    document.head.appendChild(style);
  }

  // Aplicar filtro verde temporariamente
  const originalFilter = canvas.style.filter;
  canvas.style.filter = 'hue-rotate(90deg) saturate(2)';

  // Remover após 8 segundos
  setTimeout(() => {
    clearInterval(matrixInterval);
    const matrixC = document.getElementById('matrixCanvas');
    if (matrixC) matrixC.remove();
    if (matrixNotif) matrixNotif.remove();
    canvas.style.filter = originalFilter;
  }, 8000);
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

// Easter Egg: Adicionar partícula de Schrödinger aleatoriamente
setInterval(() => {
  if (Math.random() < 0.05 && particles.length < config.particleCount) {
    particles.push(new SchrodingerParticle());
  }
}, 2000);

// Inicializar WebGL Lens se está marcado por padrão
if (document.getElementById('glslLens').checked) {
  setTimeout(() => {
    console.log('Inicializando WebGL Lens na carga...');
    webglLens = new window.WebGLLens('webglCanvas');
    if (webglLens && webglLens.gl) {
      webglLens.resize(width, height);
      webglLens.enable();
      config.glslLens = true;
    } else {
      console.error('WebGL não disponível');
      document.getElementById('glslLens').checked = false;
      config.glslLens = false;
    }
  }, 100);
}

animate();

console.log('🌑 Buraco Negro inicializado com sucesso!');
console.log('Presets disponíveis:', Object.keys(BLACK_HOLE_PRESETS));
