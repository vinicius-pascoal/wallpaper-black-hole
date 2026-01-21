// Vertex Shader para Lente Gravitacional
const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader para Lente Gravitacional Realista
const gravitationalLensShader = `
uniform sampler2D tDiffuse;
uniform vec2 blackHolePos;
uniform float schwarzschildRadius;
uniform float lensStrength;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

#define PI 3.14159265359

// Cálculo da deflexão gravitacional baseado na métrica de Schwarzschild
vec2 gravitationalDeflection(vec2 pos, vec2 bhPos, float rs) {
    vec2 toBlackHole = pos - bhPos;
    float dist = length(toBlackHole);
    
    // Evitar singularidade
    if (dist < rs * 0.5) {
        return vec2(0.0);
    }
    
    // Ângulo de deflexão: δθ ≈ 4GM/c²b onde b é o parâmetro de impacto
    // Simplificado: δθ ≈ 2rs/b
    float deflectionAngle = (2.0 * rs) / dist;
    
    // Intensidade da deflexão diminui com a distância
    float strength = lensStrength * rs / (dist * dist);
    strength = min(strength, 1.0);
    
    // Direção perpendicular ao vetor buraco negro -> pixel
    vec2 perpendicular = vec2(-toBlackHole.y, toBlackHole.x);
    perpendicular = normalize(perpendicular);
    
    // Aplicar deflexão
    return perpendicular * deflectionAngle * strength;
}

// Redshift gravitacional
float gravitationalRedshift(float dist, float rs) {
    // z = 1/sqrt(1 - rs/r) - 1
    float ratio = rs / max(dist, rs * 1.1);
    ratio = clamp(ratio, 0.0, 0.95);
    return 1.0 / sqrt(1.0 - ratio) - 1.0;
}

// Doppler shift para matéria em órbita
vec3 dopplerShift(vec3 color, vec2 pos, vec2 bhPos, float rs) {
    vec2 toBlackHole = pos - bhPos;
    float dist = length(toBlackHole);
    
    if (dist < rs * 3.0 && dist > rs * 1.1) {
        // Velocidade orbital: v ≈ sqrt(GM/r)
        float orbitalVel = sqrt(rs / dist);
        
        // Ângulo de rotação (sentido horário)
        float angle = atan(toBlackHole.y, toBlackHole.x);
        float rotationPhase = angle + time * orbitalVel;
        
        // Componente radial da velocidade (aproximação)
        float radialVel = sin(rotationPhase) * orbitalVel;
        
        // Blue shift (approaching) vs Red shift (receding)
        if (radialVel > 0.0) {
            // Blue shift
            color.b += radialVel * 0.3;
        } else {
            // Red shift
            color.r -= radialVel * 0.3;
        }
    }
    
    return color;
}

// Anel de Einstein (Einstein Ring)
float einsteinRing(vec2 pos, vec2 bhPos, float rs) {
    float dist = length(pos - bhPos);
    float ringRadius = rs * 2.6; // Raio do anel de fótons
    float ringWidth = rs * 0.3;
    
    float ringDist = abs(dist - ringRadius);
    float ringIntensity = smoothstep(ringWidth, 0.0, ringDist);
    
    return ringIntensity;
}

void main() {
    vec2 uv = vUv;
    vec2 pos = uv * resolution;
    vec2 bhPos = blackHolePos * resolution;
    
    // Raio de Schwarzschild em pixels
    float rs = schwarzschildRadius;
    
    // Distância ao buraco negro
    float dist = length(pos - bhPos);
    
    // Aplicar lente gravitacional
    vec2 deflection = gravitationalDeflection(pos / resolution, bhPos / resolution, rs / resolution.x);
    vec2 lensedUV = uv + deflection * 0.1;
    
    // Garantir que UV está no range válido
    lensedUV = clamp(lensedUV, 0.0, 1.0);
    
    // Amostra a textura com UV distorcido
    vec4 color = texture2D(tDiffuse, lensedUV);
    
    // Aplicar redshift gravitacional
    float redshift = gravitationalRedshift(dist, rs);
    color.rgb *= (1.0 - redshift * 0.3);
    
    // Shift de cor (red shift)
    color.r += redshift * 0.2;
    color.b -= redshift * 0.15;
    
    // Doppler shift
    color.rgb = dopplerShift(color.rgb, pos, bhPos, rs);
    
    // Einstein Ring
    float ring = einsteinRing(pos, bhPos, rs);
    color.rgb += vec3(1.0, 0.9, 0.7) * ring * 0.5;
    
    // Sombra do buraco negro (event horizon)
    if (dist < rs * 1.5) {
        float shadowStrength = smoothstep(rs * 1.5, rs * 0.8, dist);
        color.rgb *= (1.0 - shadowStrength * 0.95);
    }
    
    // Photon sphere glow
    if (dist > rs * 2.4 && dist < rs * 2.8) {
        float glowDist = abs(dist - rs * 2.6);
        float glow = smoothstep(rs * 0.4, 0.0, glowDist);
        color.rgb += vec3(1.0, 0.8, 0.4) * glow * 0.3;
    }
    
    gl_FragColor = color;
}
`;

// Shader para o disco de acreção com realismo aprimorado
const accretionDiskShader = `
uniform float time;
uniform vec2 resolution;
uniform vec2 blackHolePos;
uniform float innerRadius;
uniform float outerRadius;
uniform float speed;

varying vec2 vUv;

#define PI 3.14159265359

// Noise function para turbulência
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Temperatura do disco baseada na distância (Lei de Planck simplificada)
vec3 temperatureColor(float temp) {
    // temp: 0.0 (frio) até 1.0 (quente)
    vec3 color;
    
    if (temp < 0.25) {
        // Vermelho escuro
        color = mix(vec3(0.2, 0.0, 0.0), vec3(0.8, 0.0, 0.0), temp * 4.0);
    } else if (temp < 0.5) {
        // Laranja
        color = mix(vec3(0.8, 0.0, 0.0), vec3(1.0, 0.5, 0.0), (temp - 0.25) * 4.0);
    } else if (temp < 0.75) {
        // Amarelo
        color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.3), (temp - 0.5) * 4.0);
    } else {
        // Branco-azulado (muito quente)
        color = mix(vec3(1.0, 1.0, 0.3), vec3(0.8, 0.9, 1.0), (temp - 0.75) * 4.0);
    }
    
    return color;
}

void main() {
    vec2 pos = vUv * resolution;
    vec2 bhPos = blackHolePos * resolution;
    vec2 toBlackHole = pos - bhPos;
    
    float dist = length(toBlackHole);
    float angle = atan(toBlackHole.y, toBlackHole.x);
    
    // Verificar se está na região do disco
    if (dist > innerRadius && dist < outerRadius) {
        // Velocidade Kepleriana: v ∝ 1/sqrt(r)
        float angularSpeed = speed / sqrt(dist / innerRadius);
        float rotatingAngle = angle + time * angularSpeed * 0.01;
        
        // Temperatura (mais quente perto do buraco negro)
        float temp = 1.0 - smoothstep(innerRadius, outerRadius, dist);
        
        // Turbulência
        vec2 noiseCoord = vec2(rotatingAngle * 5.0, dist * 0.05);
        float turbulence = noise(noiseCoord + time * 0.1);
        turbulence += noise(noiseCoord * 2.0 + time * 0.15) * 0.5;
        turbulence += noise(noiseCoord * 4.0 + time * 0.2) * 0.25;
        turbulence /= 1.75;
        
        // Cor baseada na temperatura
        vec3 color = temperatureColor(temp);
        
        // Modular intensidade com turbulência
        float intensity = turbulence * (0.5 + temp * 0.5);
        
        // Hotspots (regiões mais brilhantes)
        float hotspot = smoothstep(0.7, 1.0, turbulence) * temp;
        intensity += hotspot * 0.5;
        
        // Fade nas bordas
        float innerFade = smoothstep(innerRadius, innerRadius * 1.2, dist);
        float outerFade = smoothstep(outerRadius, outerRadius * 0.8, dist);
        intensity *= innerFade * outerFade;
        
        gl_FragColor = vec4(color * intensity, intensity * 0.8);
    } else {
        discard;
    }
}
`;

export { vertexShader, gravitationalLensShader, accretionDiskShader };
