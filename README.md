# 🌑 Buraco Negro Realista - Wallpaper Interativo

Um plano de fundo animado e interativo de um buraco negro com física realista, disco de acreção estilo M87/Interstellar, efeitos gravitacionais avançados e lente gravitacional GLSL em tempo real.

![Status](https://img.shields.io/badge/Status-Completo-success)
![Tech](https://img.shields.io/badge/Tech-Canvas%202D%20%7C%20WebGL-blue)
![Physics](https://img.shields.io/badge/Physics-Relatividade%20Geral-purple)
![Performance](https://img.shields.io/badge/Performance-60%20FPS-green)

## ✨ Características Principais

### 🌌 Presets de Buracos Negros Famosos
- **Sagittarius A*** - Buraco negro supermassivo no centro da Via Láctea
- **M87*** - Primeiro buraco negro fotografado pela Event Horizon Telescope
- **Cygnus X-1** - Sistema binário de raio-X, primeiro buraco negro estelar confirmado
- **Personalizado** - Configure seus próprios parâmetros

### 🔬 Lente Gravitacional GLSL Avançada
- **Shader GLSL otimizado** com efeitos visuais aprimorados
- **Aberração Cromática** - Separação RGB para efeito arco-íris
- **Magnificação Gravitacional** - Amplificação até 3x perto do horizonte
- **Distorção Dinâmica** - Modulação temporal com animação espiral
- **Redshift melhorado** - Gradação de cores realista (vermelho/magenta/ouro)
- **Brilho do Horizonte** - Glow roxo/magenta pulsante
- **Sombra Respirante** - Efeito "breathing" na sombra do buraco negro
- **Photon Sphere Animada** - Anel de fótons com pulsação temporal

### 🔥 Efeitos Físicos Realistas
- **Força Gravitacional**: F = G·M/r² (Física newtoniana)
- **Disco de Acreção**: 25 anéis concêntricos com rotação diferencial e hotspots
- **Partículas Dinâmicas**: Sistema otimizado com 50-5000 partículas
- **Event Horizon**: Horizonte de eventos com sombra baseada no M87
- **Photon Sphere**: Esfera de fótons com Einstein Ring
- **Redshift Gravitacional**: Mudança de cor baseada na distância
- **Spaghettification**: Alongamento de partículas próximas ao horizonte

### 🚀 Efeitos Astrofísicos Avançados
- **🌌 Jatos Relativísticos** - Partículas ejetadas pelos polos
- **💫 Radiação Hawking** - Emissão quântica no horizonte de eventos
- **🔮 Ergosfera** - Região pulsante onde o espaço-tempo é arrastado
- **🌀 Frame Dragging** - Espirais representando arrasto do espaço-tempo

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
- ♾️ Zoom Infinito
- 🔬 Lente Gravitacional GLSL
- 🌌 Jatos Relativísticos
- 💫 Radiação Hawking
- 🔮 Ergosfera
- 🌀 Frame Dragging

## 🚀 Como Usar

1. Abra o arquivo `index.html` em qualquer navegador moderno
2. Use o painel de controles (⚙️) no canto superior direito
3. Ajuste os parâmetros em tempo real
4. Clique em 🔄 Resetar para voltar às configurações padrão

## 🎨 Tecnologias Utilizadas

- **HTML5 Canvas 2D** - Renderização otimizada de partículas e disco de acreção
- **WebGL** - Renderização acelerada por GPU para lente gravitacional
- **GLSL Shaders** - Computação paralela na GPU com efeitos dinâmicos
- **JavaScript ES6+** - Lógica, física e interatividade
- **CSS3** - Interface responsiva e animações
- **RequestAnimationFrame** - Loop de animação otimizado (60 FPS)

## 📊 Performance

- **FPS Target**: 60 FPS
- **Otimizações**:
  - Damping de velocidade (0.99)
  - Reciclagem de partículas
  - Canvas com `willReadFrequently`
  - Renderização condicional

## 📝 Estrutura de Arquivos

```
wallpaper-black-hole/
├── index.html        # Estrutura HTML e controles
├── style.css         # Estilos CSS e animações
├── script-simple.js  # Lógica principal com Canvas 2D + física
├── webgl-lens.js     # Shader GLSL para lente gravitacional
├── README.md         # Documentação do projeto
└── .git/             # Histórico Git
```

## 🎯 Recursos Implementados

### ✅ Física e Efeitos Visuais
- [x] **Lente Gravitacional GLSL Avançada** com aberração cromática
- [x] **Redshift Gravitacional** baseado em equações relativísticas
- [x] **Einstein Ring** com pulsação dinâmica
- [x] **Disco de Acreção M87-style** com hotspots animados
- [x] **Radiação Hawking** com partículas quânticas
- [x] **Jatos Relativísticos** nos polos
- [x] **Ergosfera** pulsante
- [x] **Frame Dragging** com espirais animadas
- [x] **Spaghettification** de partículas

### 🌌 Controles e Presets
- [x] **3 Presets de Buracos Negros** (Sagittarius A*, M87*, Cygnus X-1)
- [x] **Modo Personalizado** configurável
- [x] **Controles Dinâmicos** em tempo real
- [x] **Toggle de Efeitos** individuais

### 🚀 Otimizações
- [x] **60 FPS Target** otimizado
- [x] **Renderização Híbrida** (WebGL + Canvas 2D)
- [x] **Auto-inicialização** de WebGL
- [x] **Reciclagem de Partículas** eficiente

## 📋 Requisitos

- **Navegador moderno** com suporte a:
  - HTML5 Canvas
  - WebGL 1.0+
  - JavaScript ES6+
  - CSS3

**Recomendados:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 💡 Dicas de Uso

1. **Melhor Performance**: Reduzir quantidade de partículas em dispositivos antigos
2. **Melhor Visual**: Aumentar `lensStrength` para distorção mais evidente
3. **Efeitos Dramáticos**: Ativar todos os efeitos e aumentar `accretionSpeed`
4. **Preset M87**: Massa 280, Partículas 1500 para efeito mais realista
5. **Lente GLSL**: Ativar para ver aberração cromática e redshift em tempo real

## � Melhorias Futuras

### 🎯 Funcionalidades Planejadas
- [ ] **Sistema de Som Espacial** - Áudio reativo à proximidade do buraco negro
- [ ] **Modo VR/360°** - Experiência imersiva em realidade virtual
- [ ] **Simulação de Acreção Realística** - Física de fluidos no disco
- [ ] **Sistema Binário** - Dois buracos negros orbitando
- [ ] **Ondas Gravitacionais** - Visualização de ripples no espaço-tempo
- [ ] **Estrelas Capturadas** - Objetos estelares sendo despedaçados (tidal disruption)
- [ ] **Trajetórias de Geodésicas** - Visualização de caminhos de luz
- [ ] **Modo Foto** - Captura de screenshots em alta resolução
- [ ] **Exportar Animação** - Gravar vídeo da simulação

### 🎨 Melhorias Visuais
- [ ] **Neblosa de Fundo** - Galáxias e nebulosas ao fundo
- [ ] **Partículas 3D** - Sistema de partículas com Three.js
- [ ] **Bloom Effect** - Post-processing para brilho intenso
- [ ] **Motion Blur** - Rastro de movimento nas partículas
- [ ] **Color Grading** - Paletas de cores personalizáveis
- [ ] **Depth of Field** - Foco seletivo cinematográfico
- [ ] **Lens Flare** - Reflexos de lente no photon sphere
- [ ] **Volumetric Light** - Raios de luz volumétricos

### 🧪 Física Avançada
- [ ] **Órbitas Estáveis** - Partículas em órbitas circulares estáveis
- [ ] **Precessão de Periélio** - Efeito relativístico nas órbitas
- [ ] **Efeito Shapiro** - Atraso temporal da luz
- [ ] **Blueshift/Redshift Doppler** - Mudança de frequência por velocidade
- [ ] **Kerr Black Hole** - Buraco negro rotativo (solução de Kerr)
- [ ] **Disco de Acreção Quente vs Frio** - Estados diferentes do disco
- [ ] **Simulação de Maré Gravitacional** - Spaghettification detalhada
- [ ] **Temperatura do Disco** - Gradiente de temperatura realístico

### 🎮 Interatividade
- [ ] **Controle com Mouse** - Arrastar para orbitar câmera
- [ ] **Controle com Touch** - Gestos em dispositivos móveis
- [ ] **Lançar Partículas** - Clique para adicionar partículas
- [ ] **Modo Sandbox** - Criar múltiplos buracos negros
- [ ] **Timeline de Simulação** - Controlar tempo (acelerar/desacelerar)
- [ ] **Gravação de Replay** - Salvar e reproduzir simulações
- [ ] **Share Links** - Compartilhar configurações via URL

### 🎁 Easter Eggs e Surpresas
- [ ] **Konami Code** - Ativa modo "Universo Paralelo" com cores invertidas
- [ ] **Double Click no Centro** - Cria um mini buraco branco (anti-buraco negro)
- [ ] **Pressionar '42'** - Referência ao Guia do Mochileiro das Galáxias
- [ ] **Modo Retro** - Visual pixelado 8-bit ao pressionar 'R'
- [ ] **Portal Secreto** - Clique 7x no logo para abrir portal interdimensional
- [ ] **Gato de Schrödinger** - Partícula especial que existe/não existe simultaneamente
- [ ] **Mensagem de Hawking** - Quote aleatório de Stephen Hawking ao pausar
- [ ] **Time Lord Mode** - Ao pressionar 'T', o tempo flui ao contrário
- [ ] **Matrix Mode** - Código verde estilo Matrix com 'M'
- [ ] **Singularity Voice** - Sussurros cósmicos quando muito perto do horizonte
- [ ] **Hidden Preset: TON 618** - Buraco negro supermassivo colossal (66 bilhões de massas solares)
- [ ] **Event Horizon Song** - Melodia gerada pela frequência das partículas
- [ ] **Cosmic Joke** - Pressionar Ctrl+Alt+Delete mostra "Cannot delete universe.exe"

### 🌐 Integração e Compartilhamento
- [ ] **API REST** - Endpoints para configurar via código
- [ ] **Discord Rich Presence** - Mostrar status no Discord
- [ ] **Wallpaper Engine** - Integração com Steam Wallpaper Engine
- [ ] **OBS Browser Source** - Usar como overlay em streams
- [ ] **Exportar NFT** - Mint snapshot como NFT (blockchain)

## �📜 Licença

Livre para uso pessoal e educacional.

---

**Aproveite sua jornada pelo horizonte de eventos!** 🚀✨

*Última atualização: Janeiro 2026*
