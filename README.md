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

## 🎮 Easter Eggs Secretos

### 🔮 Como Ativar
Passe o mouse no **topo central da tela** para revelar o **campo de entrada secreto**. Ele aparecerá gradualmente com uma leve transparência. Digite um comando e pressione **Enter** para ativar o efeito!

### 📝 Comandos Disponíveis

#### 🎯 42
Digite **'42'** para ativar a referência ao **Guia do Mochileiro das Galáxias**. A toalha será sugada para dentro do buraco negro com rotação de 1080° e efeitos gravitacionais temporários! ✨

#### 🎨 retro
Digite **'retro'** para ativar o **Modo Retro 8-bit**. O visual pixelado transforma a experiência em um clássico dos anos 80 com notificação estilo terminal verde! 🎮

#### 🐱🌈 nyan
Digite **'nyan'** para fazer o lendário **Nyan Cat** orbitar o buraco negro por 10 segundos com seu GIF animado original! 

#### 📞 tardis
Digite **'tardis'** para ativar o efeito **Doctor Who**. O buraco negro piscará rapidamente simulando a materialização da TARDIS! "Wibbly Wobbly Timey Wimey" 🕰️

#### 💚 matrix
Digite **'matrix'** para entrar no **Modo Matrix**. Código verde cairá pela tela por 8 segundos enquanto o buraco negro ganha um filtro cibernético! "Wake up, Neo..."

#### 🔵🟠 portal
Digite **'portal'** para ativar os **Portais do Portal**. Dois portais (azul e laranja) aparecem e as partículas se teletransportam entre eles por 12 segundos! "The cake is a lie" 🎂

#### 📺 glitch
Digite **'glitch'** para ativar **corrupção digital extrema**! Efeitos de RGB split, scan lines, static noise e distorções visuais por 6 segundos. "REALITY.CORRUPTED" ⚠️

#### ⚡ tesla
Digite **'tesla'** para ativar a **Bobina de Tesla**! Raios elétricos roxos e azuis conectam as partículas entre si e com o buraco negro por 8 segundos. "HIGH VOLTAGE WARNING" ⚡

#### 😈 doom
Digite **'doom'** para ativar o modo **DOOM**! Um pentagrama demoníaco vermelho gira ao redor do buraco negro enquanto um filtro infernal transforma tudo em vermelho. "RIP AND TEAR!" por 8 segundos! 🔥

#### ❓ ajuda
Digite **'ajuda'** ou **'help'** para ver a lista completa de comandos disponíveis em uma notificação estilo terminal.

#### 👻 Gato de Schrödinger (Automático)
O sistema gera espontaneamente **partículas de Schrödinger** a cada 2 segundos que **existem e não existem simultaneamente**. Observe-as alternando entre visível e fantasmagórico!

## 📋 Melhorias Futuras

### 🎯 Funcionalidades Planejadas
- [ ] **Simulação de Acreção Realística** - Física de fluidos no disco
- [ ] **Ondas Gravitacionais** - Visualização de ripples no espaço-tempo
- [ ] **Trajetórias de Geodésicas** - Visualização de caminhos de luz

### 🎨 Melhorias Visuais
- [x] **Neblosa de Fundo** - Nebulosas procedurais ao fundo
- [ ] **Partículas 3D** - Sistema de partículas com Three.js
- [ ] **Bloom Effect** - Post-processing para brilho intenso
- [ ] **Motion Blur** - Rastro de movimento nas partículas
- [ ] **Color Grading** - Paletas de cores personalizáveis
- [ ] **Depth of Field** - Foco seletivo cinematográfico
- [ ] **Lens Flare** - Reflexos de lente no photon sphere
- [ ] **Volumetric Light** - Raios de luz volumétricos

### 🎮 Interatividade
- [ ] **Controle com Mouse** - Arrastar para orbitar câmera
- [ ] **Controle com Touch** - Gestos em dispositivos móveis
- [ ] **Lançar Partículas** - Clique para adicionar partículas

### 🎁 Easter Eggs e Surpresas

**🔮 Como Ativar Easter Eggs:**
Passe o mouse no **topo central da tela** para revelar o campo de entrada secreto. Digite um comando e pressione **Enter**!

**Comandos Disponíveis:**
- [x] **42** - Toalha sendo sugada para o buraco negro (Guia do Mochileiro das Galáxias)
- [x] **retro** - Modo Retro 8-bit com visual pixelado
- [x] **nyan** - Nyan Cat orbita o buraco negro por 10 segundos 🐱🌈
- [x] **tardis** - Buraco negro pisca (Doctor Who) 📞
- [x] **matrix** - Código verde caindo estilo Matrix por 8 segundos 💚
- [x] **portal** - Dois portais aparecem e partículas se teletransportam entre eles por 12 segundos 🔵🟠
- [x] **glitch** - Corrupção digital extrema com RGB split e scan lines por 6 segundos 📺
- [x] **tesla** - Bobina de Tesla com raios elétricos roxos/azuis conectando partículas por 8 segundos ⚡
- [x] **doom** - Pentagrama demoníaco vermelho girando com filtro infernal por 8 segundos 😈
- [x] **ajuda** - Mostra lista de comandos disponíveis
- [x] **Gato de Schrödinger** - Partículas quânticas aparecem automaticamente a cada 2 segundos



## �📜 Licença

Livre para uso pessoal e educacional.

---

**Aproveite sua jornada pelo horizonte de eventos!** 🚀✨

*Última atualização: Janeiro 2026*
