# 🌑 Buraco Negro Realista - Wallpaper Interativo

Um plano de fundo animado e interativo de um buraco negro com física realista, disco de acreção, efeitos gravitacionais e fenômenos astrofísicos avançados. Agora com **WebGL/Three.js** e **shaders GLSL** para lente gravitacional real!

![Preview](https://img.shields.io/badge/Status-Completo-success)
![Tech](https://img.shields.io/badge/Tech-WebGL%20%7C%20Three.js%20%7C%20GLSL-blue)
![Physics](https://img.shields.io/badge/Physics-Relatividade%20Geral-purple)
![Shaders](https://img.shields.io/badge/Shaders-GLSL-orange)

## ✨ Características Principais

### 🌌 Presets de Buracos Negros Famosos
- **Sagittarius A*** - Buraco negro supermassivo no centro da Via Láctea (4.1 milhões de massas solares)
- **M87*** - Primeiro buraco negro fotografado pela Event Horizon Telescope (6.5 bilhões de massas solares)
- **Cygnus X-1** - Sistema binário de raio-X, primeiro buraco negro estelar confirmado (21 massas solares)
- **Personalizado** - Configure seus próprios parâmetros

### 🔬 Lente Gravitacional GLSL Real
- **Shader GLSL** para simulação precisa da deflexão da luz
- **Métrica de Schwarzschild** - Cálculo baseado em Relatividade Geral
- **Redshift Gravitacional** - z = 1/√(1 - rs/r) - 1
- **Doppler Shift** - Para matéria em órbita
- **Einstein Ring** - Anel de fótons na esfera de fótons
- **Sombra do Buraco Negro** - Baseada nas observações do M87

### 🔥 Efeitos Físicos Realistas
- **Força Gravitacional**: F = G·M/r² (Física newtoniana)
- **Disco de Acreção**: 8 anéis concêntricos com rotação diferencial e hotspots
- **Partículas Dinâmicas**: Sistema otimizado com 200-5000 partículas (padrão: 300)
- **Event Horizon**: Horizonte de eventos com sombra baseada no M87
- **Photon Sphere**: Esfera de fótons com Einstein Ring
- **Redshift Gravitacional**: Mudança de cor baseada na distância
- **Spaghettification**: Alongamento de partículas próximas ao horizonte

### 🚀 Efeitos Astrofísicos Avançados
- **🌌 Jatos Relativísticos** - Partículas ejetadas pelos polos a velocidades relativísticas
- **💫 Radiação Hawking** - Emissão quântica no horizonte de eventos
- **🔮 Ergosfera** - Região pulsante onde o espaço-tempo é arrastado
- **🌀 Frame Dragging** - Espirais representando arrasto do espaço-tempo
- **⏱️ Dilatação Temporal** - Visualização da desaceleração do tempo

### 🎮 Controles Interativos
| Controle | Função | Range |
|----------|--------|-------|
| 🎯 Presets | Buracos negros famosos | Sagittarius A*, M87*, Cygnus X-1, Personalizado |
| 😈 Massa | Tamanho e força do buraco negro | 50-300 |
| ✨ Partículas | Quantidade de partículas | 200-5000 |
| 🌀 Gravidade | Intensidade gravitacional | 100-1000 |
| 🔮 Lente | Distorção gravitacional | 0-100 |
| 💫 Velocidade | Rotação do disco | 1-20 |

**Efeitos Ativados/Desativados:**
- 🌊 Distorção do Background
- ♾️ Zoom Infinito
- 🔬 Lente Gravitacional GLSL
- 🌌 Jatos Relativísticos
- 💫 Radiação Hawking
- 🔮 Ergosfera
- 🌀 Frame Dragging
- ⏱️ Dilatação Temporal

## 🚀 Como Usar

1. Abra o arquivo `index.html` em qualquer navegador moderno
2. Use o painel de controles (⚙️) no canto superior direito
3. Ajuste os parâmetros em tempo real
4. Clique em 🔄 Resetar para voltar às configurações padrão

## 🎨 Tecnologias Utilizadas

- **WebGL** - Renderização 3D acelerada por GPU
- **Three.js** - Framework 3D para WebGL
- **GLSL Shaders** - Computação paralela na GPU
  - Vertex Shader para geometria
  - Fragment Shader para lente gravitacional
  - Fragment Shader para disco de acreção
- **HTML5 Canvas 2D** - Overlay para partículas
- **JavaScript ES6+ Modules** - Lógica e física
- **CSS3** - Interface e animações
- **RequestAnimationFrame** - Loop de animação otimizado (60 FPS)

## 📊 Performance

- **FPS Target**: 60 FPS
- **Otimizações**:
  - Damping de velocidade (0.99)
  - Reciclagem de partículas
  - Canvas com `willReadFrequently`
  - Renderização condicional

## 🔬 Física Implementada

### Lente Gravitacional (Relatividade Geral)
**GLSL Shader implementando a Métrica de Schwarzschild:**
```glsl
// Ângulo de deflexão: δθ ≈ 4GM/c²b
// Simplificado: δθ ≈ 2rs/b
float deflectionAngle = (2.0 * rs) / dist;
```

### Redshift Gravitacional
```glsl
// z = 1/sqrt(1 - rs/r) - 1
float ratio = rs / max(dist, rs * 1.1);
float redshift = 1.0 / sqrt(1.0 - ratio) - 1.0;
```

### Força Gravitacional (Newtoniana)
```javascript
F = (G * M) / r²
```
Onde:
- G = Constante gravitacional (configurável)
- M = Massa do buraco negro
- r = Distância ao centro

### Movimento Orbital Kepleriano
```glsl
// Velocidade orbital: v ≈ sqrt(GM/r)
float orbitalVel = sqrt(rs / dist);
```

### Schwarzschild Radius
```javascript
r_s = 2GM/c² ≈ 60 * (M / 150)
```

### Einstein Ring
```glsl
// Raio do anel de fótons: r_photon ≈ 2.6 * r_s
float ringRadius = rs * 2.6;
```

## 🎯 Recursos Implementados

### ✅ Física e Efeitos Visuais
- [x] **Lente Gravitacional GLSL Real** - Shader baseado na Métrica de Schwarzschild
- [x] **Redshift Gravitacional** - Implementação da equação z = 1/√(1 - rs/r) - 1
- [x] **Doppler Shift** - Para matéria em órbita no disco de acreção
- [x] **Einstein Ring** - Anel de fótons na esfera de fótons (2.6 * rs)
- [x] **Radiação Hawking animada** - Partículas quânticas emitidas do horizonte
- [x] **Jatos Relativísticos** - Partículas ejetadas pelos polos
- [x] **Ergosfera** - Região de arrasto do espaço-tempo
- [x] **Frame Dragging** - Visualização de espirais rotacionais
- [x] **Dilatação Temporal** - Efeito visual de distorção temporal

### 🌌 Sistema de Presets
- [x] **Sagittarius A*** - Centro da Via Láctea (4.1M massas solares)
- [x] **M87*** - Primeiro BH fotografado (6.5B massas solares)
- [x] **Cygnus X-1** - BH estelar binário (21 massas solares)
- [x] **Modo Personalizado** - Parâmetros configuráveis

### 🚀 Performance e Tecnologia
- [x] **WebGL/Three.js** - Renderização acelerada por GPU
- [x] **GLSL Shaders** - Computação paralela massiva
- [x] **Sistema Híbrido** - WebGL 3D + Canvas 2D para partículas
- [x] **60 FPS Target** - Loop otimizado com requestAnimationFrame

## 📝 Estrutura de Arquivos

```
wallpaper-black-hole/
├── index.html          # Estrutura HTML
├── style.css           # Estilos e animações
├── script-webgl.js     # Lógica principal com Three.js (ES6 Module)
├── shaders.js          # Shaders GLSL (Vertex + Fragment)
├── script.js           # Versão legada 2D Canvas (backup)
└── README.md           # Este arquivo
```

## 🎓 Conceitos de Física Implementados

### Métrica de Schwarzschild
A métrica de Schwarzschild descreve o espaço-tempo ao redor de um buraco negro:
```
ds² = -(1 - rs/r)c²dt² + (1 - rs/r)⁻¹dr² + r²dΩ²
```
Onde rs é o raio de Schwarzschild: rs = 2GM/c²

### Deflexão da Luz
A deflexão gravitacional da luz é calculada como:
```
δθ = 4GM/c²b = 2rs/b
```
Onde b é o parâmetro de impacto (distância perpendicular ao buraco negro)

### Velocidade Orbital Kepleriana
Partículas no disco de acreção seguem velocidades orbitais:
```
v = √(GM/r)
```
Resultando em rotação diferencial (mais rápido perto do buraco negro)

## 📜 Licença

Livre para uso pessoal e educacional.

---

**Aproveite sua jornada pelo horizonte de eventos!** 🚀✨
