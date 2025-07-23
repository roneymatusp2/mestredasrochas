// ===== GAME CONSTANTS =====
const GAME_CONFIG = {
    BOARD_SIZE: 7,
    MAX_ENERGY: 10,
    PHASES_PER_ROUND: 5,
    MAX_ROUNDS: 8,
    END_CONDITIONS: {
        REVEALED_TILES: 15,
        GENIES_SUMMONED: 4,
        ROUNDS_COMPLETED: 6
    }
};

const MINERALS = {
    Talco: { mohs: 1, color: 'talco', basePrice: 2 },
    Quartzo: { mohs: 7, color: 'quartzo', basePrice: 3 },
    Corindo: { mohs: 9, color: 'corindo', basePrice: 5 },
    Magnetita: { mohs: 6, color: 'magnetita', basePrice: 3 },
    Hackmanita: { mohs: 6.5, color: 'hackmanita', basePrice: 4 }
};

const FACTIONS = {
    'Coração Cristalino': {
        bonus: 'Lapidar pedras duras (Mohs ≥ 7) custa -1 energia',
        penalty: 'Extração 20% mais lenta',
        specialAbility: 'hardStoneDiscount'
    },
    'Forjadores do Núcleo': {
        bonus: '+3 energia inicial, golems custam -1 fragmento',
        penalty: 'Lapidação custa +1 energia',
        specialAbility: 'golemMaster'
    },
    'Escribas dos Estratos': {
        bonus: '+1 fragmento inicial, pode espiar eventos',
        penalty: 'Energia máxima reduzida para 8',
        specialAbility: 'knowledge'
    },
    'Prospecionistas Gnômicos': {
        bonus: 'Extração dupla adjacente com 1 ação',
        penalty: 'Valor de venda -1 nas primeiras 3 rodadas',
        specialAbility: 'efficientMining'
    }
};

const GEOLOGICAL_EVENTS = [
    {
        name: 'Terremoto Sísmico',
        description: 'Tremores abalam a mina! Todos perdem 2 energia.',
        effect: (game) => { game.state.energy = Math.max(0, game.state.energy - 2); },
        type: 'negative'
    },
    {
        name: 'Veio Rico Descoberto',
        description: 'Uma nova veia mineral é encontrada! Ganhe 2 Quartzo bruto.',
        effect: (game) => { game.state.rawMinerals.Quartzo += 2; },
        type: 'positive'
    },
    {
        name: 'Eco-Golem Interferência',
        description: 'Golems antigos perturbam o mercado. Todos os preços +1.',
        effect: (game) => { 
            Object.keys(game.state.market).forEach(mineral => {
                game.state.market[mineral] += 1;
            });
        },
        type: 'neutral'
    },
    {
        name: 'Cristalização Mágica',
        description: 'Energias místicas aceleram a formação de gemas. Próxima lapidação grátis.',
        effect: (game) => { game.state.freeLapidation = true; },
        type: 'positive'
    },
    {
        name: 'Tempestade Magnética',
        description: 'Campos magnéticos alteram a Magnetita. Ela vale +2 pontos quando lapidada.',
        effect: (game) => { game.state.magnetitaBonus = true; },
        type: 'special'
    },
    {
        name: 'Gênio Ancestral Desperta',
        description: 'Um gênio antigo oferece sabedoria. Ganhe +5 pontos e 1 fragmento.',
        effect: (game) => { 
            game.state.points += 5; 
            game.state.fragments += 1; 
        },
        type: 'legendary'
    }
];

// ===== GAME STATE =====
class GameState {
    constructor() {
        this.faction = '';
        this.round = 1;
        this.phase = 1;
        this.energy = 10;
        this.maxEnergy = 10;
        this.points = 0;
        this.fragments = 0;
        this.coins = 0;
        this.golems = 0;
        this.genies = 0;
        this.playerX = 3;
        this.playerY = 3;
        this.revealedTiles = 0;
        
        this.rawMinerals = {};
        this.processedGems = {};
        this.market = {};
        
        // Initialize minerals
        Object.keys(MINERALS).forEach(mineral => {
            this.rawMinerals[mineral] = 0;
            this.processedGems[mineral] = 0;
            this.market[mineral] = MINERALS[mineral].basePrice;
        });
        
        // Special states
        this.freeLapidation = false;
        this.magnetitaBonus = false;
        this.gameOver = false;
        this.endConditionsMet = 0;
        
        // Board state
        this.board = Array(GAME_CONFIG.BOARD_SIZE).fill().map(() => 
            Array(GAME_CONFIG.BOARD_SIZE).fill('unrevealed')
        );
        
        // Audio settings
        this.audioEnabled = true;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
    }
    
    applyFactionBonus(faction) {
        this.faction = faction;
        
        switch(faction) {
            case 'Forjadores do Núcleo':
                this.energy += 3;
                this.maxEnergy += 3;
                break;
            case 'Escribas dos Estratos':
                this.fragments += 1;
                this.maxEnergy = 8;
                break;
        }
    }
}

// ===== MAIN GAME CLASS =====
class MestreDasRochas {
    constructor() {
        this.state = new GameState();
        this.ui = new UIManager();
        this.audio = new AudioManager();
        this.particles = null;
        
        this.initialize();
    }
    
    async initialize() {
        await this.setupParticles();
        await this.audio.initialize();
        this.setupEventListeners();
        this.showLoadingScreen();
        
        // Simulate loading time
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showFactionSelection();
        }, 3000);
    }
    
    async setupParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: '#00d4ff' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: false },
                    size: { value: 3, random: true },
                    line_linked: { enable: true, distance: 150, color: '#00d4ff', opacity: 0.4, width: 1 },
                    move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
                    modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
                },
                retina_detect: true
            });
        }
    }
    
    setupEventListeners() {
        // Faction selection
        document.querySelectorAll('.faction-card').forEach(card => {
            card.addEventListener('click', () => {
                const faction = card.dataset.faction;
                this.selectFaction(faction);
            });
        });
        
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.executeAction(action);
            });
        });
        
        // Phase button
        document.getElementById('next-phase').addEventListener('click', () => {
            this.nextPhase();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const keyMap = {
                '1': 'explore',
                '2': 'extract', 
                '3': 'cut',
                '4': 'imbue',
                '5': 'golem',
                '6': 'trade',
                '0': 'next-phase'
            };
            
            if (keyMap[e.key]) {
                e.preventDefault();
                if (e.key === '0') {
                    this.nextPhase();
                } else {
                    this.executeAction(keyMap[e.key]);
                }
            }
        });
        
        // Settings
        document.getElementById('settings-fab').addEventListener('click', () => {
            this.showSettings();
        });
        
        // Board controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomBoard(1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomBoard(0.8));
        document.getElementById('center-view').addEventListener('click', () => this.centerBoard());
    }
    
    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }
    
    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }
    
    showFactionSelection() {
        document.getElementById('faction-modal').classList.add('active');
    }
    
    selectFaction(faction) {
        this.state.applyFactionBonus(faction);
        document.getElementById('faction-modal').classList.remove('active');
        document.getElementById('game-interface').style.display = 'grid';
        
        this.ui.updateDisplay(this.state);
        this.renderBoard();
        this.logMessage(`Ordem ${faction} selecionada! Que os gênios guiem seus passos.`, 'welcome');
        
        this.audio.playSound('success');
    }
    
    executeAction(action) {
        if (this.state.gameOver) return;
        
        switch(action) {
            case 'explore':
                this.logMessage('Clique em um hexágono adjacente para explorar.', 'info');
                break;
            case 'extract':
                this.extractMinerals();
                break;
            case 'cut':
                this.lapidateGems();
                break;
            case 'imbue':
                this.imbueGenie();
                break;
            case 'golem':
                this.commandGolem();
                break;
            case 'trade':
                this.sellGems();
                break;
        }
        
        this.ui.updateDisplay(this.state);
        this.checkEndConditions();
    }
    
    extractMinerals() {
        const availableMinerals = Object.keys(this.state.rawMinerals)
            .filter(mineral => this.state.rawMinerals[mineral] > 0);
            
        if (availableMinerals.length === 0) {
            this.logMessage('Nenhum mineral bruto disponível para extração.', 'warning');
            return;
        }
        
        const energyCost = Math.floor(Math.random() * 3) + 1;
        if (this.state.energy < energyCost) {
            this.logMessage('Energia insuficiente para extração.', 'error');
            return;
        }
        
        const mineral = availableMinerals[Math.floor(Math.random() * availableMinerals.length)];
        const amount = Math.floor(Math.random() * 3) + 1;
        
        // Apply faction bonus
        let finalAmount = amount;
        if (this.state.faction === 'Prospecionistas Gnômicos') {
            finalAmount += 1;
        }
        
        this.state.energy -= energyCost;
        this.state.rawMinerals[mineral]--;
        this.state.processedGems[mineral] += finalAmount;
        
        this.logMessage(`Extraiu ${finalAmount} gema(s) de ${mineral}. (-${energyCost} energia)`, 'success');
        this.audio.playSound('success');
    }
    
    lapidateGems() {
        const availableGems = Object.keys(this.state.processedGems)
            .filter(mineral => this.state.processedGems[mineral] > 0);
            
        if (availableGems.length === 0) {
            this.logMessage('Nenhuma gema disponível para lapidação.', 'warning');
            return;
        }
        
        const mineral = availableGems[Math.floor(Math.random() * availableGems.length)];
        let energyCost = Math.ceil(MINERALS[mineral].mohs / 2);
        
        // Apply faction bonuses/penalties
        if (this.state.faction === 'Coração Cristalino' && MINERALS[mineral].mohs >= 7) {
            energyCost -= 1;
        }
        if (this.state.faction === 'Forjadores do Núcleo') {
            energyCost += 1;
        }
        if (this.state.freeLapidation) {
            energyCost = 0;
            this.state.freeLapidation = false;
        }
        
        energyCost = Math.max(0, energyCost);
        
        if (this.state.energy < energyCost) {
            this.logMessage('Energia insuficiente para lapidação.', 'error');
            return;
        }
        
        this.state.energy -= energyCost;
        this.state.processedGems[mineral]--;
        this.state.fragments++;
        
        let points = MINERALS[mineral].mohs;
        if (mineral === 'Magnetita' && this.state.magnetitaBonus) {
            points += 2;
            this.state.magnetitaBonus = false;
        }
        if (mineral === 'Quartzo' && Math.random() > 0.5) {
            points += 2;
            this.logMessage('Cristal de quartzo fraturou perfeitamente! +2 pontos bônus!', 'success');
        }
        
        this.state.points += points;
        
        this.logMessage(`Lapidou ${mineral}. (+${points} pontos, +1 fragmento, -${energyCost} energia)`, 'success');
        this.audio.playSound('success');
    }
    
    imbueGenie() {
        if (this.state.fragments < 3) {
            this.logMessage('Necessário pelo menos 3 fragmentos para imbuir um gênio.', 'warning');
            return;
        }
        
        const availableGems = Object.keys(this.state.processedGems)
            .filter(mineral => this.state.processedGems[mineral] > 0);
            
        if (availableGems.length === 0) {
            this.logMessage('Nenhuma gema disponível para imbuição.', 'warning');
            return;
        }
        
        const mineral = availableGems[Math.floor(Math.random() * availableGems.length)];
        
        this.state.fragments -= 3;
        this.state.processedGems[mineral]--;
        this.state.genies++;
        this.state.points += 10;
        
        // Every 2 genies grants a golem
        if (this.state.genies % 2 === 0) {
            this.state.golems++;
            this.logMessage(`Gênio de ${mineral} invocado! Um golem também desperta! (+10 pontos, +1 golem)`, 'success');
        } else {
            this.logMessage(`Gênio de ${mineral} invocado! (+10 pontos)`, 'success');
        }
        
        this.audio.playSound('success');
    }
    
    commandGolem() {
        if (this.state.golems < 1) {
            this.logMessage('Nenhum golem disponível para comando.', 'warning');
            return;
        }
        
        let fragmentCost = 1;
        if (this.state.faction === 'Forjadores do Núcleo') {
            fragmentCost = 0;
        }
        
        if (this.state.fragments < fragmentCost) {
            this.logMessage(`Necessário ${fragmentCost} fragmento(s) para comandar golem.`, 'warning');
            return;
        }
        
        this.state.golems--;
        this.state.fragments -= fragmentCost;
        this.state.points += 5;
        
        this.logMessage(`Golem comandado! Área consolidada. (+5 pontos)`, 'success');
        this.audio.playSound('success');
    }
    
    sellGems() {
        const availableGems = Object.keys(this.state.processedGems)
            .filter(mineral => this.state.processedGems[mineral] > 0);
            
        if (availableGems.length === 0) {
            this.logMessage('Nenhuma gema disponível para venda.', 'warning');
            return;
        }
        
        const mineral = availableGems[Math.floor(Math.random() * availableGems.length)];
        let price = this.state.market[mineral];
        
        // Apply faction penalty
        if (this.state.faction === 'Prospecionistas Gnômicos' && this.state.round <= 3) {
            price = Math.max(1, price - 1);
        }
        
        this.state.processedGems[mineral]--;
        this.state.coins += price;
        this.state.market[mineral] = Math.max(1, this.state.market[mineral] - 1);
        
        this.logMessage(`Vendeu ${mineral} por ${price} moedas. (Preço de mercado reduzido)`, 'success');
        this.audio.playSound('success');
    }
    
    nextPhase() {
        this.state.phase++;
        
        if (this.state.phase > GAME_CONFIG.PHASES_PER_ROUND) {
            this.state.phase = 1;
            this.state.round++;
            this.triggerGeologicalEvent();
            this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + 5);
        }
        
        this.ui.updateDisplay(this.state);
        this.checkEndConditions();
        
        this.logMessage(`Fase ${this.state.phase} da Rodada ${this.state.round} iniciada.`, 'info');
    }
    
    triggerGeologicalEvent() {
        const event = GEOLOGICAL_EVENTS[Math.floor(Math.random() * GEOLOGICAL_EVENTS.length)];
        
        this.logMessage(`🌍 EVENTO GEOLÓGICO: ${event.name}`, 'warning');
        this.logMessage(event.description, 'warning');
        
        event.effect(this);
        
        this.audio.playSound('click');
    }
    
    checkEndConditions() {
        let conditionsMet = 0;
        
        if (this.state.revealedTiles >= GAME_CONFIG.END_CONDITIONS.REVEALED_TILES) conditionsMet++;
        if (this.state.genies >= GAME_CONFIG.END_CONDITIONS.GENIES_SUMMONED) conditionsMet++;
        if (this.state.round >= GAME_CONFIG.END_CONDITIONS.ROUNDS_COMPLETED) conditionsMet++;
        
        if (conditionsMet >= 2) {
            this.endGame();
        }
    }
    
    endGame() {
        this.state.gameOver = true;
        this.state.points += this.state.coins * 2; // Coins convert to points at end
        
        this.showGameOverModal();
        this.audio.playSound('success');
    }
    
    showGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        const scoreDiv = document.getElementById('final-score');
        
        scoreDiv.innerHTML = `
            <h3>Pontuação Final: ${this.state.points}</h3>
            <div class="score-breakdown">
                <div class="score-item">
                    <span>Gemas Lapidadas:</span>
                    <span>${this.state.points - (this.state.coins * 2)}</span>
                </div>
                <div class="score-item">
                    <span>Moedas (x2):</span>
                    <span>${this.state.coins * 2}</span>
                </div>
                <div class="score-item">
                    <span>Gênios Invocados:</span>
                    <span>${this.state.genies}</span>
                </div>
                <div class="score-item">
                    <span>Tiles Revelados:</span>
                    <span>${this.state.revealedTiles}</span>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        
        // Setup restart button
        document.getElementById('play-again').onclick = () => {
            location.reload();
        };
    }
    
    renderBoard() {
        const board = document.getElementById('hex-board');
        board.innerHTML = '';
        
        // Create premium SVG element with optimal settings
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 650 550');
        svg.setAttribute('width', '100%');
        svg.style.height = 'auto';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.maxWidth = '650px';
        svg.style.maxHeight = '550px';
        svg.style.shapeRendering = 'geometricPrecision';
        svg.style.textRendering = 'optimizeLegibility';
        
        // Add advanced gradient definitions and filters
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create premium gradient definitions for each mineral
        const createGradient = (id, color1, color2, color3) => {
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
            gradient.setAttribute('id', id);
            gradient.setAttribute('cx', '30%');
            gradient.setAttribute('cy', '30%');
            gradient.setAttribute('r', '70%');
            
            gradient.innerHTML = `
                <stop offset="0%" stop-color="${color1}" stop-opacity="1"/>
                <stop offset="50%" stop-color="${color2}" stop-opacity="1"/>
                <stop offset="100%" stop-color="${color3}" stop-opacity="1"/>
            `;
            return gradient;
        };
        
        // Premium mineral gradients
        defs.appendChild(createGradient('gradientTalco', '#F5DEB3', '#D2B48C', '#A0855B'));
        defs.appendChild(createGradient('gradientQuartzo', '#DDA0DD', '#9370DB', '#663399'));
        defs.appendChild(createGradient('gradientCorindo', '#FF6B6B', '#DC143C', '#8B0000'));
        defs.appendChild(createGradient('gradientMagnetita', '#A9A9A9', '#696969', '#2F2F2F'));
        defs.appendChild(createGradient('gradientHackmanita', '#BA55D3', '#8A2BE2', '#4B0082'));
        defs.appendChild(createGradient('gradientUnrevealed', '#777', '#555', '#333'));
        
        // Create advanced 3D bevel filters
        const createAdvancedBevelFilter = (id, shadowColor, highlightColor, glowColor) => {
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.setAttribute('id', id);
            filter.setAttribute('x', '-50%');
            filter.setAttribute('y', '-50%');
            filter.setAttribute('width', '200%');
            filter.setAttribute('height', '200%');
            
            filter.innerHTML = `
                <!-- Main shadow -->
                <feOffset dx="3" dy="3" in="SourceAlpha" result="offsetDown"/>
                <feGaussianBlur in="offsetDown" stdDeviation="3" result="blurDown"/>
                <feFlood flood-color="${shadowColor}" flood-opacity="0.7" result="colorDown"/>
                <feComposite in="colorDown" in2="blurDown" operator="in" result="shadowDown"/>
                
                <!-- Highlight -->
                <feOffset dx="-2" dy="-2" in="SourceAlpha" result="offsetUp"/>
                <feGaussianBlur in="offsetUp" stdDeviation="1.5" result="blurUp"/>
                <feFlood flood-color="${highlightColor}" flood-opacity="0.9" result="colorUp"/>
                <feComposite in="colorUp" in2="blurUp" operator="in" result="highlightUp"/>
                
                <!-- Inner glow -->
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="innerGlow"/>
                <feFlood flood-color="${glowColor}" flood-opacity="0.3" result="glowColor"/>
                <feComposite in="glowColor" in2="innerGlow" operator="in" result="innerGlowFinal"/>
                
                <!-- Outer glow -->
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="outerGlow"/>
                <feFlood flood-color="${glowColor}" flood-opacity="0.2" result="outerGlowColor"/>
                <feComposite in="outerGlowColor" in2="outerGlow" operator="in" result="outerGlowFinal"/>
                
                <feMerge>
                    <feMergeNode in="shadowDown"/>
                    <feMergeNode in="outerGlowFinal"/>
                    <feMergeNode in="innerGlowFinal"/>
                    <feMergeNode in="highlightUp"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            `;
            return filter;
        };
        
        defs.appendChild(createAdvancedBevelFilter('bevelUnrevealed', '#000', '#AAA', '#666'));
        defs.appendChild(createAdvancedBevelFilter('bevelTalco', '#8B4513', '#FFFACD', '#DEB887'));
        defs.appendChild(createAdvancedBevelFilter('bevelQuartzo', '#2F0F5F', '#E6E6FA', '#9370DB'));
        defs.appendChild(createAdvancedBevelFilter('bevelCorindo', '#5F0000', '#FFB6C1', '#DC143C'));
        defs.appendChild(createAdvancedBevelFilter('bevelMagnetita', '#1C1C1C', '#D3D3D3', '#696969'));
        defs.appendChild(createAdvancedBevelFilter('bevelHackmanita', '#0F0F3F', '#DDA0DD', '#8A2BE2'));
        
        // Advanced player glow filter with pulsing effect
        const playerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        playerGlow.setAttribute('id', 'playerGlow');
        playerGlow.setAttribute('x', '-100%');
        playerGlow.setAttribute('y', '-100%');
        playerGlow.setAttribute('width', '300%');
        playerGlow.setAttribute('height', '300%');
        playerGlow.innerHTML = `
            <!-- Multi-layer glow effect -->
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur3"/>
            
            <!-- Golden glow layers -->
            <feColorMatrix in="blur1" values="1 0.8 0 0 0  0 0.8 0 0 0  0 0 1 0 0  0 0 0 2 0" result="glow1"/>
            <feColorMatrix in="blur2" values="1 0.9 0.2 0 0  0 0.7 0.1 0 0  0 0.1 0.8 0 0  0 0 0 1.5 0" result="glow2"/>
            <feColorMatrix in="blur3" values="1 0.95 0.4 0 0  0 0.6 0.2 0 0  0 0.2 0.6 0 0  0 0 0 1 0" result="glow3"/>
            
            <!-- Combine all layers -->
            <feMerge>
                <feMergeNode in="glow3"/>
                <feMergeNode in="glow2"/>
                <feMergeNode in="glow1"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `;
        defs.appendChild(playerGlow);
        
        // Sparkle effect filter for special actions
        const sparkleFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        sparkleFilter.setAttribute('id', 'sparkleEffect');
        sparkleFilter.setAttribute('x', '-50%');
        sparkleFilter.setAttribute('y', '-50%');
        sparkleFilter.setAttribute('width', '200%');
        sparkleFilter.setAttribute('height', '200%');
        sparkleFilter.innerHTML = `
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="sparkleBlur"/>
            <feColorMatrix in="sparkleBlur" values="1.5 0 0.5 0 0  0 1.5 0.5 0 0  0.5 0 1.5 0 0  0 0 0 1 0" result="sparkleGlow"/>
            <feComposite in="SourceGraphic" in2="sparkleGlow" operator="over"/>
        `;
        defs.appendChild(sparkleFilter);
        
        svg.appendChild(defs);
        
        // Premium hexagon geometry with perfect proportions
        const HEX_SIZE = 38;
        const HEX_WIDTH = HEX_SIZE * 2;
        const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;
        const HORIZONTAL_SPACING = HEX_WIDTH * 0.76;
        const VERTICAL_SPACING = HEX_HEIGHT * 0.88;
        const ROW_OFFSET = HORIZONTAL_SPACING / 2;
        
        // Calculate optimal board dimensions and centering
        const BOARD_WIDTH = 650;
        const BOARD_HEIGHT = 550;
        const totalWidth = (GAME_CONFIG.BOARD_SIZE - 1) * HORIZONTAL_SPACING + HEX_WIDTH;
        const totalHeight = (GAME_CONFIG.BOARD_SIZE - 1) * VERTICAL_SPACING + HEX_HEIGHT;
        const offsetX = (BOARD_WIDTH - totalWidth) / 2 + HEX_SIZE;
        const offsetY = (BOARD_HEIGHT - totalHeight) / 2 + HEX_SIZE;
        
        // Premium function to generate perfect hexagon points
        const getHexagonPoints = (centerX, centerY, size) => {
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angleDeg = 60 * i - 30; // Flat-top hexagon for optimal visual appeal
                const angleRad = (Math.PI / 180) * angleDeg;
                const x = centerX + size * Math.cos(angleRad);
                const y = centerY + size * Math.sin(angleRad);
                points.push(`${x.toFixed(3)},${y.toFixed(3)}`);
            }
            return points.join(' ');
        };
        
        // Render hexagons
        for (let y = 0; y < GAME_CONFIG.BOARD_SIZE; y++) {
            for (let x = 0; x < GAME_CONFIG.BOARD_SIZE; x++) {
                // Calculate position with honeycomb offset
                const rowOffset = y % 2 === 1 ? ROW_OFFSET : 0;
                const centerX = offsetX + x * HORIZONTAL_SPACING + rowOffset;
                const centerY = offsetY + y * VERTICAL_SPACING;
                
                const tileState = this.state.board[y][x];
                const isPlayerPosition = (x === this.state.playerX && y === this.state.playerY);
                
                // Create hexagon group
                const hexGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                hexGroup.classList.add('hex-tile');
                hexGroup.dataset.x = x;
                hexGroup.dataset.y = y;
                
                // Determine colors, gradients and advanced effects
                let fillColor = 'url(#gradientUnrevealed)';
                let textColor = '#ccc';
                let filterEffect = 'url(#bevelUnrevealed)';
                let displayText = '?';
                let strokeColor = '#333';
                let strokeWidth = 2;
                
                if (tileState !== 'unrevealed') {
                    hexGroup.classList.add('revealed');
                    hexGroup.classList.add(MINERALS[tileState].color);
                    
                    switch(tileState) {
                        case 'Talco':
                            fillColor = 'url(#gradientTalco)';
                            textColor = '#2c1810';
                            filterEffect = 'url(#bevelTalco)';
                            strokeColor = '#8B4513';
                            break;
                        case 'Quartzo':
                            fillColor = 'url(#gradientQuartzo)';
                            textColor = 'white';
                            filterEffect = 'url(#bevelQuartzo)';
                            strokeColor = '#4B0082';
                            break;
                        case 'Corindo':
                            fillColor = 'url(#gradientCorindo)';
                            textColor = 'white';
                            filterEffect = 'url(#bevelCorindo)';
                            strokeColor = '#8B0000';
                            break;
                        case 'Magnetita':
                            fillColor = 'url(#gradientMagnetita)';
                            textColor = 'white';
                            filterEffect = 'url(#bevelMagnetita)';
                            strokeColor = '#2F4F4F';
                            break;
                        case 'Hackmanita':
                            fillColor = 'url(#gradientHackmanita)';
                            textColor = 'white';
                            filterEffect = 'url(#bevelHackmanita)';
                            strokeColor = '#191970';
                            break;
                    }
                    displayText = tileState[0];
                } else {
                    hexGroup.classList.add('unrevealed');
                }
                
                if (isPlayerPosition) {
                    hexGroup.classList.add('player-position');
                    filterEffect = 'url(#playerGlow)';
                    strokeColor = '#FFD700';
                    strokeWidth = 4;
                }
                
                // Create premium hexagon polygon with advanced styling
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', getHexagonPoints(centerX, centerY, HEX_SIZE));
                polygon.setAttribute('fill', fillColor);
                polygon.setAttribute('stroke', strokeColor);
                polygon.setAttribute('stroke-width', strokeWidth);
                polygon.setAttribute('filter', filterEffect);
                polygon.setAttribute('stroke-linejoin', 'round');
                polygon.setAttribute('stroke-linecap', 'round');
                
                // Create premium text element with advanced typography
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', centerX);
                text.setAttribute('y', centerY + 2);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'central');
                text.setAttribute('fill', textColor);
                text.setAttribute('font-size', '24');
                text.setAttribute('font-weight', '700');
                text.setAttribute('font-family', 'Orbitron, Exo 2, monospace');
                text.setAttribute('letter-spacing', '1.2px');
                text.setAttribute('text-rendering', 'optimizeLegibility');
                text.style.userSelect = 'none';
                text.style.pointerEvents = 'none';
                text.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
                text.textContent = displayText;
                
                // Add premium player indicator with animation
                if (isPlayerPosition) {
                    const playerIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    playerIcon.setAttribute('x', centerX);
                    playerIcon.setAttribute('y', centerY - 18);
                    playerIcon.setAttribute('text-anchor', 'middle');
                    playerIcon.setAttribute('dominant-baseline', 'central');
                    playerIcon.setAttribute('fill', '#FFD700');
                    playerIcon.setAttribute('font-size', '18');
                    playerIcon.setAttribute('filter', 'url(#sparkleEffect)');
                    playerIcon.style.userSelect = 'none';
                    playerIcon.style.pointerEvents = 'none';
                    playerIcon.textContent = '👤';
                    
                    // Add pulsing animation
                    const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
                    animateTransform.setAttribute('attributeName', 'transform');
                    animateTransform.setAttribute('type', 'scale');
                    animateTransform.setAttribute('values', '1;1.2;1');
                    animateTransform.setAttribute('dur', '2s');
                    animateTransform.setAttribute('repeatCount', 'indefinite');
                    playerIcon.appendChild(animateTransform);
                    
                    hexGroup.appendChild(playerIcon);
                }
                
                hexGroup.appendChild(polygon);
                hexGroup.appendChild(text);
                
                // Add premium interaction events
                hexGroup.addEventListener('click', (e) => {
                    this.clickHex(x, y);
                    // Add click ripple effect
                    this.addClickRipple(centerX, centerY, svg);
                });
                
                hexGroup.addEventListener('mouseenter', () => {
                    hexGroup.style.transform = 'scale(1.05)';
                    hexGroup.style.transformOrigin = 'center';
                });
                
                hexGroup.addEventListener('mouseleave', () => {
                    hexGroup.style.transform = 'scale(1)';
                });
                
                hexGroup.style.cursor = 'pointer';
                hexGroup.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                
                svg.appendChild(hexGroup);
            }
        }
        
        board.appendChild(svg);
    }
    
    clickHex(x, y) {
        if (this.state.phase !== 1) {
            this.logMessage('Exploração só é possível na Fase 1.', 'warning');
            return;
        }
        
        const distance = Math.abs(this.state.playerX - x) + Math.abs(this.state.playerY - y);
        if (distance > 1) {
            this.logMessage('Só é possível mover para hexágonos adjacentes.', 'warning');
            return;
        }
        
        const energyCost = 1 + Math.floor(y / 2); // Depth cost
        if (this.state.energy < energyCost) {
            this.logMessage('Energia insuficiente para exploração.', 'error');
            return;
        }
        
        this.state.energy -= energyCost;
        this.state.playerX = x;
        this.state.playerY = y;
        
        if (this.state.board[y][x] === 'unrevealed') {
            const minerals = Object.keys(MINERALS);
            const discoveredMineral = minerals[Math.floor(Math.random() * minerals.length)];
            
            this.state.board[y][x] = discoveredMineral;
            this.state.rawMinerals[discoveredMineral]++;
            this.state.revealedTiles++;
            
            this.logMessage(`Descobriu ${discoveredMineral} em (${x},${y})! (+1 mineral bruto, -${energyCost} energia)`, 'success');
            this.audio.playSound('success');
        } else {
            this.logMessage(`Moveu para (${x},${y}). (-${energyCost} energia)`, 'info');
        }
        
        this.renderBoard();
        this.ui.updateDisplay(this.state);
    }
    
    logMessage(message, type = 'info') {
        const log = document.getElementById('event-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                    type === 'warning' ? '⚠️' : 
                    type === 'error' ? '❌' : 
                    type === 'welcome' ? '🌟' : 'ℹ️';
        
        entry.innerHTML = `<i>${icon}</i><span>${message}</span>`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }
    
    zoomBoard(factor) {
        const board = document.getElementById('hex-board');
        const currentScale = parseFloat(board.style.transform.replace('scale(', '').replace(')', '') || '1');
        const newScale = Math.max(0.5, Math.min(2, currentScale * factor));
        board.style.transform = `scale(${newScale})`;
    }
    
    centerBoard() {
        const board = document.getElementById('hex-board');
        board.style.transform = 'scale(1)';
    }
    
    addClickRipple(x, y, svg) {
        // Create ripple effect circle
        const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ripple.setAttribute('cx', x);
        ripple.setAttribute('cy', y);
        ripple.setAttribute('r', '0');
        ripple.setAttribute('fill', 'none');
        ripple.setAttribute('stroke', '#00D4FF');
        ripple.setAttribute('stroke-width', '3');
        ripple.setAttribute('opacity', '0.8');
        
        // Add ripple animation
        const animateRadius = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateRadius.setAttribute('attributeName', 'r');
        animateRadius.setAttribute('values', '0;50;80');
        animateRadius.setAttribute('dur', '0.6s');
        animateRadius.setAttribute('fill', 'freeze');
        
        const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateOpacity.setAttribute('attributeName', 'opacity');
        animateOpacity.setAttribute('values', '0.8;0.4;0');
        animateOpacity.setAttribute('dur', '0.6s');
        animateOpacity.setAttribute('fill', 'freeze');
        
        ripple.appendChild(animateRadius);
        ripple.appendChild(animateOpacity);
        svg.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    showSettings() {
        document.getElementById('settings-modal').classList.add('active');
        
        document.getElementById('close-settings').onclick = () => {
            document.getElementById('settings-modal').classList.remove('active');
        };
    }
}

// ===== UI MANAGER =====
class UIManager {
    updateDisplay(state) {
        // Update status
        document.getElementById('faction-name').textContent = state.faction || '-';
        document.getElementById('round-phase').textContent = `${state.round}-${state.phase}`;
        document.getElementById('energy').textContent = state.energy;
        document.getElementById('points').textContent = state.points;
        document.getElementById('coins').textContent = state.coins;
        document.getElementById('fragments').textContent = state.fragments;
        
        // Update gems display
        this.updateGemsDisplay(state);
        this.updateMarketDisplay(state);
    }
    
    updateGemsDisplay(state) {
        const container = document.getElementById('gems-display');
        container.innerHTML = '';
        
        Object.keys(MINERALS).forEach(mineral => {
            const item = document.createElement('div');
            item.className = 'gem-item';
            item.innerHTML = `
                <div class="gem-icon ${MINERALS[mineral].color}"></div>
                <span class="gem-name">${mineral}</span>
                <span class="gem-count">${state.processedGems[mineral]}</span>
            `;
            container.appendChild(item);
        });
    }
    
    updateMarketDisplay(state) {
        const container = document.getElementById('market-display');
        container.innerHTML = '';
        
        Object.keys(MINERALS).forEach(mineral => {
            const item = document.createElement('div');
            item.className = 'market-item';
            item.innerHTML = `
                <div class="gem-icon ${MINERALS[mineral].color}"></div>
                <span class="gem-name">${mineral}</span>
                <span class="market-price">${state.market[mineral]} 💰</span>
            `;
            container.appendChild(item);
        });
    }
}

// ===== AUDIO MANAGER =====
class AudioManager {
    constructor() {
        this.sounds = {};
        this.initialized = false;
    }
    
    async initialize() {
        if (this.initialized) return;
        
        // Create simple audio context for sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initialized = true;
    }
    
    playSound(type) {
        if (!this.initialized) return;
        
        // Create simple beep sounds
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const frequency = type === 'success' ? 800 : 
                         type === 'error' ? 300 : 600;
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
}

// ===== INITIALIZE GAME =====
let game;

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar o jogo (vídeo será mostrado automaticamente pelo intro-video-simple.js)
    game = new MestreDasRochas();
});
