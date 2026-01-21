# 🌑 Buraco Negro Realista - Wallpaper Interativo

Um plano de fundo animado e interativo de um buraco negro com física realista, disco de acreção, e efeitos gravitacionais.

![Preview](https://img.shields.io/badge/Status-Completo-success)
![Tech](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JavaScript-blue)

## ✨ Características

### 🔥 Efeitos Físicos Realistas
- **Força Gravitacional**: F = G·M/r² (Física newtoniana)
- **Disco de Acreção**: 15 anéis concêntricos com rotação diferencial
- **Partículas Dinâmicas**: Sistema com até 5000 partículas simultâneas
- **Event Horizon**: Horizonte de eventos renderizado
- **Photon Sphere**: Esfera de fótons luminescente
- **Redshift Gravitacional**: Mudança de cor baseada na distância

### 🎮 Controles Interativos
| Controle | Função | Range |
|----------|--------|-------|
| 😈 Massa | Altera o tamanho e força do buraco negro | 50-300 |
| ✨ Partículas | Quantidade de partículas ativas | 500-5000 |
| 🌀 Gravidade | Intensidade da força gravitacional | 100-1000 |
| 🔮 Lente | Força da distorção gravitacional | 0-100 |
| 💫 Velocidade | Rotação do disco de acreção | 1-20 |

### 🌊 Efeitos Extras
- ✅ **Distorção do Background** - Grid espacial curvado
- ✅ **Zoom Infinito** - Partículas reaparecem continuamente
- ✅ **Controle de Massa** - Ajuste dinâmico do buraco negro
- ✅ **Estrelas de fundo** - Campo estelar animado
- ✅ **FPS Counter** - Monitor de performance

## 🚀 Como Usar

1. Abra o arquivo `index.html` em qualquer navegador moderno
2. Use o painel de controles (⚙️) no canto superior direito
3. Ajuste os parâmetros em tempo real
4. Clique em 🔄 Resetar para voltar às configurações padrão

## 🎨 Tecnologias Utilizadas

- **HTML5 Canvas** - Renderização gráfica
- **JavaScript ES6+** - Lógica e física
- **CSS3** - Interface e animações
- **RequestAnimationFrame** - Loop de animação otimizado

## 📊 Performance

- **FPS Target**: 60 FPS
- **Otimizações**:
  - Damping de velocidade (0.99)
  - Reciclagem de partículas
  - Canvas com `willReadFrequently`
  - Renderização condicional

## 🔬 Física Implementada

### Força Gravitacional
```javascript
F = (G * M) / r²
```
Onde:
- G = Constante gravitacional (configurável)
- M = Massa do buraco negro
- r = Distância ao centro

### Movimento Orbital
```javascript
velocidade_tangencial = força * 0.3 * velocidade_acreção
```

### Schwarzschild Radius
```javascript
r_s = 60 * (M / 150)
```

## 🎯 Recursos Futuros (Opcional)

- [ ] Shader GLSL para lente gravitacional real
- [ ] WebGL/Three.js para melhor performance
- [ ] Radiação Hawking animada
- [ ] Jets relativísticos
- [ ] Modo VR/360°
- [ ] Exportação como vídeo
- [ ] Presets de buracos negros famosos (Sagittarius A*, M87)

## 📝 Estrutura de Arquivos

```
wallpaper-black-hole/
├── index.html      # Estrutura HTML
├── style.css       # Estilos e animações
├── script.js       # Lógica e física
└── README.md       # Este arquivo
```

## 📜 Licença

Livre para uso pessoal e educacional.

---

**Aproveite sua jornada pelo horizonte de eventos!** 🚀✨
