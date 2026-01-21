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

    // Fragment Shader com Lente Gravitacional
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
            
            // Deflexão gravitacional baseada na métrica de Schwarzschild
            vec2 gravitationalDeflection(vec2 pos, vec2 bhPos, float rs, float strength) {
                vec2 toBlackHole = pos - bhPos;
                float dist = length(toBlackHole);
                
                // Evitar singularidade
                if (dist < rs * 0.5) {
                    return vec2(0.0);
                }
                
                // Ângulo de deflexão: δθ ≈ 2rs/b (aproximação)
                float deflectionAngle = (2.0 * rs) / dist;
                
                // Intensidade da deflexão diminui com a distância
                float intensity = strength * rs / (dist * dist);
                intensity = min(intensity, 1.0);
                
                // Direção perpendicular
                vec2 perpendicular = vec2(-toBlackHole.y, toBlackHole.x);
                perpendicular = normalize(perpendicular);
                
                return perpendicular * deflectionAngle * intensity;
            }
            
            // Redshift gravitacional
            float gravitationalRedshift(float dist, float rs) {
                float ratio = rs / max(dist, rs * 1.1);
                ratio = clamp(ratio, 0.0, 0.95);
                return 1.0 / sqrt(1.0 - ratio) - 1.0;
            }
            
            // Einstein Ring
            float einsteinRing(vec2 pos, vec2 bhPos, float rs) {
                float dist = length(pos - bhPos);
                float ringRadius = rs * 2.6;
                float ringWidth = rs * 0.3;
                
                float ringDist = abs(dist - ringRadius);
                float ringIntensity = smoothstep(ringWidth, 0.0, ringDist);
                
                return ringIntensity;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                vec2 pos = uv * u_resolution;
                vec2 bhPos = u_blackHolePos * u_resolution;
                float rs = u_schwarzschildRadius;
                
                float dist = length(pos - bhPos);
                
                // Aplicar lente gravitacional
                vec2 deflection = gravitationalDeflection(
                    pos / u_resolution, 
                    bhPos / u_resolution, 
                    rs / u_resolution.x,
                    u_lensStrength
                );
                
                vec2 lensedUV = uv + deflection * 0.15;
                lensedUV = clamp(lensedUV, 0.0, 1.0);
                
                // Amostra a textura com UV distorcido
                vec4 color = texture2D(u_texture, lensedUV);
                
                // Aplicar redshift gravitacional
                float redshift = gravitationalRedshift(dist, rs);
                color.rgb *= (1.0 - redshift * 0.3);
                color.r += redshift * 0.2;
                color.b -= redshift * 0.15;
                
                // Einstein Ring
                float ring = einsteinRing(pos, bhPos, rs);
                color.rgb += vec3(1.0, 0.9, 0.7) * ring * 0.3;
                
                // Sombra do buraco negro
                if (dist < rs * 1.5) {
                    float shadowStrength = smoothstep(rs * 1.5, rs * 0.8, dist);
                    color.rgb *= (1.0 - shadowStrength * 0.95);
                }
                
                // Photon sphere glow
                if (dist > rs * 2.4 && dist < rs * 2.8) {
                    float glowDist = abs(dist - rs * 2.6);
                    float glow = smoothstep(rs * 0.4, 0.0, glowDist);
                    color.rgb += vec3(1.0, 0.8, 0.4) * glow * 0.2;
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
