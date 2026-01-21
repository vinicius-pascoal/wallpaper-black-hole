// ===================================
// WEBGL GRAVITATIONAL LENS SHADER
// ===================================

class WebGLLens {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

    if (!this.gl) {
      console.error('WebGL não disponível');
      return null;
    }

    this.sourceCanvas = document.getElementById('blackHoleCanvas');
    this.texture = null;
    this.program = null;
    this.enabled = false;

    this.init();
  }

  init() {
    const gl = this.gl;

    // Vertex Shader
    const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

    // Fragment Shader com Lente Gravitacional Avançada
    const fragmentShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_texture;
            uniform vec2 u_resolution;
            uniform vec2 u_blackHolePos;
            uniform float u_schwarzschildRadius;
            uniform float u_lensStrength;
            uniform float u_time;
            
            varying vec2 v_texCoord;
            
            #define PI 3.14159265359
            
            // Deflexão gravitacional baseada na métrica de Schwarzschild com distorção dinâmica
            vec2 gravitationalDeflection(vec2 pos, vec2 bhPos, float rs, float strength, float time) {
                vec2 toBlackHole = pos - bhPos;
                float dist = length(toBlackHole);
                
                // Evitar singularidade
                if (dist < rs * 0.3) {
                    return vec2(0.0);
                }
                
                // Ângulo de deflexão com modulação temporal
                float timeModulation = sin(time * 0.5) * 0.2 + 0.9;
                float deflectionAngle = (2.5 * rs) / (dist + 0.1) * timeModulation;
                
                // Intensidade com atenuação suave
                float intensity = strength * rs / (dist * dist * 0.8);
                intensity = clamp(intensity, 0.0, 1.5);
                
                // Direção radial e tangencial combinadas
                vec2 radial = normalize(toBlackHole);
                vec2 tangential = vec2(-toBlackHole.y, toBlackHole.x);
                tangential = normalize(tangential);
                
                // Mistura direção para efeito espiral
                float spiralFactor = sin(atan(toBlackHole.y, toBlackHole.x) + time * 0.3) * 0.3;
                vec2 direction = mix(radial, tangential, spiralFactor + 0.5);
                
                return direction * deflectionAngle * intensity;
            }
            
            // Redshift gravitacional melhorado
            float gravitationalRedshift(float dist, float rs) {
                float ratio = rs / max(dist, rs * 0.9);
                ratio = clamp(ratio, 0.0, 0.95);
                return 1.0 / sqrt(1.0 - ratio * 0.9) - 1.0;
            }
            
            // Aberração cromática (separação de cores)
            vec3 chromaticAberration(sampler2D tex, vec2 uv, float dist, float rs, float aberration) {
                float aberrationStrength = aberration * (1.0 - clamp(dist / (rs * 4.0), 0.0, 1.0));
                
                vec2 aberrDir = normalize(uv - 0.5) * aberrationStrength * 0.02;
                
                float r = texture2D(tex, uv - aberrDir * 1.5).r;
                float g = texture2D(tex, uv).g;
                float b = texture2D(tex, uv + aberrDir * 1.5).b;
                
                return vec3(r, g, b);
            }
            
            // Einstein Ring com pulsação
            float einsteinRing(vec2 pos, vec2 bhPos, float rs, float time) {
                float dist = length(pos - bhPos);
                float ringRadius = rs * 2.6;
                float ringWidth = rs * 0.25;
                
                // Pulsação temporal
                float pulse = sin(time * 1.5) * 0.1 + 0.9;
                ringRadius *= pulse;
                
                float ringDist = abs(dist - ringRadius);
                float ringIntensity = smoothstep(ringWidth, 0.0, ringDist);
                
                // Brilho adicional
                ringIntensity *= (sin(time + dist * 0.01) * 0.2 + 0.8);
                
                return ringIntensity;
            }
            
            // Amplificação gravitacional (Magnification)
            float gravitationalMagnification(float dist, float rs) {
                float magnif = rs / max(dist, rs * 0.5);
                magnif = clamp(magnif * magnif, 0.5, 3.0);
                return magnif;
            }
            
            // Sombra dinâmica do buraco negro
            float blackHoleShadow(float dist, float rs, float time) {
                float shadowRadius = rs * 1.8;
                float shadowEdge = rs * 0.5;
                
                // Efeito de "breathing"
                float breathing = sin(time * 0.8) * 0.1 + 1.0;
                shadowRadius *= breathing;
                
                float shadow = smoothstep(shadowRadius + shadowEdge, shadowRadius - shadowEdge, dist);
                return shadow;
            }
            
            // Brilho do horizonte de eventos
            float eventHorizonGlow(float dist, float rs, float time) {
                float glowRadius = rs * 1.1;
                float glowWidth = rs * 0.3;
                
                float glowDist = abs(dist - glowRadius);
                float glow = exp(-glowDist * glowDist / (glowWidth * glowWidth));
                
                // Pulsação
                glow *= (sin(time * 2.0 + glowDist * 0.1) * 0.3 + 0.7);
                
                return glow;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                vec2 pos = uv * u_resolution;
                vec2 bhPos = u_blackHolePos * u_resolution;
                float rs = u_schwarzschildRadius;
                
                float dist = length(pos - bhPos);
                
                // Aplicar lente gravitacional com dinâmica temporal
                vec2 deflection = gravitationalDeflection(
                    pos / u_resolution, 
                    bhPos / u_resolution, 
                    rs / u_resolution.x,
                    u_lensStrength,
                    u_time
                );
                
                vec2 lensedUV = uv + deflection * 0.25;
                lensedUV = clamp(lensedUV, 0.0, 1.0);
                
                // Aplicar aberração cromática
                vec3 colorWithAberration = chromaticAberration(u_texture, lensedUV, dist, rs, u_lensStrength * 0.5);
                vec4 color = vec4(colorWithAberration, 1.0);
                
                // Magnificação gravitacional
                float magnif = gravitationalMagnification(dist, rs);
                color.rgb *= magnif * 0.9;
                
                // Aplicar redshift gravitacional com gradação
                float redshift = gravitationalRedshift(dist, rs);
                color.r += redshift * 0.25;
                color.g *= (1.0 - redshift * 0.15);
                color.b -= redshift * 0.2;
                
                // Einstein Ring com animação
                float ring = einsteinRing(pos, bhPos, rs, u_time);
                color.rgb += vec3(1.0, 0.95, 0.8) * ring * 0.4;
                
                // Brilho do horizonte de eventos
                float horizonGlow = eventHorizonGlow(dist, rs, u_time);
                color.rgb += vec3(0.9, 0.5, 0.8) * horizonGlow * 0.3;
                
                // Sombra do buraco negro com breathing
                float shadow = blackHoleShadow(dist, rs, u_time);
                color.rgb *= (1.0 - shadow * 0.98);
                
                // Photon sphere glow intensificado
                if (dist > rs * 2.3 && dist < rs * 3.0) {
                    float glowDist = abs(dist - rs * 2.6);
                    float glow = smoothstep(rs * 0.5, 0.0, glowDist);
                    float glowIntensity = sin(u_time * 2.0 + glowDist * 0.02) * 0.2 + 0.8;
                    color.rgb += vec3(1.0, 0.9, 0.5) * glow * glowIntensity * 0.35;
                }
                
                // Distorção radial adicional perto do horizonte
                if (dist < rs * 2.0) {
                    float radialDistort = (1.0 - dist / (rs * 2.0)) * 0.15;
                    color.rgb += vec3(0.2, 0.1, 0.3) * radialDistort;
                }
                
                gl_FragColor = color;
            }
        `;

    // Compilar shaders
    const vertexShader = this.compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      console.error('Erro ao compilar shaders');
      return;
    }

    // Criar programa
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Erro ao linkar programa:', gl.getProgramInfoLog(this.program));
      return;
    }

    // Setup geometry
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
    ]);

    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ]);

    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // TexCoord buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Criar textura
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Get uniform locations
    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      blackHolePos: gl.getUniformLocation(this.program, 'u_blackHolePos'),
      schwarzschildRadius: gl.getUniformLocation(this.program, 'u_schwarzschildRadius'),
      lensStrength: gl.getUniformLocation(this.program, 'u_lensStrength'),
      time: gl.getUniformLocation(this.program, 'u_time'),
      texture: gl.getUniformLocation(this.program, 'u_texture')
    };

    console.log('✅ WebGL Gravitational Lens inicializado');
  }

  compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  render(config, time) {
    if (!this.gl || !this.enabled) return;

    const gl = this.gl;

    // Atualizar textura com o canvas 2D
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceCanvas);

    // Usar programa
    gl.useProgram(this.program);

    // Atualizar uniforms
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.blackHolePos, 0.5, 0.5);
    gl.uniform1f(this.uniforms.schwarzschildRadius, config.schwarzschildRadius);
    gl.uniform1f(this.uniforms.lensStrength, config.lensStrength / 100.0);
    gl.uniform1f(this.uniforms.time, time);
    gl.uniform1i(this.uniforms.texture, 0);

    // Renderizar
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  resize(width, height) {
    if (!this.gl) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  enable() {
    this.enabled = true;
    this.canvas.style.display = 'block';
    console.log('🔬 Lente Gravitacional GLSL ativada');
  }

  disable() {
    this.enabled = false;
    this.canvas.style.display = 'none';
    console.log('🔬 Lente Gravitacional GLSL desativada');
  }
}

// Exportar para uso global
window.WebGLLens = WebGLLens;
