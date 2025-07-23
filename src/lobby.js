// Sistema de Lobby e Matchmaking para Mestre das Rochas
import multiplayer from './multiplayer.js';

export class LobbyUI {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.refreshInterval = null;
  }

  // Criar HTML do lobby
  createHTML() {
    return `
      <div id="lobby-container" class="lobby-container">
        <div class="lobby-content">
          <div class="lobby-header">
            <h2>Mestre das Rochas - Multiplayer</h2>
            <button class="close-btn" onclick="lobby.hide()">×</button>
          </div>

          <!-- Login -->
          <div id="login-section" class="lobby-section">
            <h3>Entrar no Jogo</h3>
            <div class="input-group">
              <input type="text" id="username-input" placeholder="Seu nome de jogador" maxlength="20" />
              <button onclick="lobby.login()" class="primary-btn">Entrar</button>
            </div>
          </div>

          <!-- Menu Principal -->
          <div id="menu-section" class="lobby-section" style="display: none;">
            <div class="player-info">
              <span>Jogador: <strong id="player-name"></strong></span>
              <button onclick="lobby.logout()" class="secondary-btn">Sair</button>
            </div>

            <div class="menu-buttons">
              <button onclick="lobby.showCreateGame()" class="menu-btn create-btn">
                <span class="icon">🏛️</span>
                Criar Partida
              </button>
              <button onclick="lobby.showJoinGame()" class="menu-btn join-btn">
                <span class="icon">🎮</span>
                Entrar em Partida
              </button>
              <button onclick="lobby.showFindGames()" class="menu-btn find-btn">
                <span class="icon">🔍</span>
                Buscar Partidas
              </button>
            </div>
          </div>

          <!-- Criar Partida -->
          <div id="create-section" class="lobby-section" style="display: none;">
            <h3>Criar Nova Partida</h3>
            <div class="game-settings">
              <div class="setting-group">
                <label>Modo de Jogo:</label>
                <select id="game-mode">
                  <option value="competitive">Competitivo</option>
                  <option value="cooperative">Cooperativo</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div class="setting-group">
                <label>Máximo de Jogadores:</label>
                <select id="max-players">
                  <option value="2">2 Jogadores</option>
                  <option value="3">3 Jogadores</option>
                  <option value="4" selected>4 Jogadores</option>
                  <option value="5">5 Jogadores</option>
                </select>
              </div>
              <div class="setting-group">
                <label>Dificuldade:</label>
                <select id="difficulty">
                  <option value="easy">Fácil</option>
                  <option value="normal" selected>Normal</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
            </div>
            <div class="button-group">
              <button onclick="lobby.createGame()" class="primary-btn">Criar Partida</button>
              <button onclick="lobby.showMenu()" class="secondary-btn">Voltar</button>
            </div>
          </div>

          <!-- Entrar em Partida -->
          <div id="join-section" class="lobby-section" style="display: none;">
            <h3>Entrar em Partida</h3>
            <div class="input-group">
              <input type="text" id="game-code-input" placeholder="Código da partida (6 caracteres)" maxlength="6" />
              <button onclick="lobby.joinGame()" class="primary-btn">Entrar</button>
            </div>
            <button onclick="lobby.showMenu()" class="secondary-btn">Voltar</button>
          </div>

          <!-- Lista de Partidas -->
          <div id="games-list-section" class="lobby-section" style="display: none;">
            <h3>Partidas Disponíveis</h3>
            <div id="games-list" class="games-list">
              <div class="loading">Carregando partidas...</div>
            </div>
            <button onclick="lobby.showMenu()" class="secondary-btn">Voltar</button>
          </div>

          <!-- Sala de Espera -->
          <div id="waiting-room-section" class="lobby-section" style="display: none;">
            <h3>Sala de Espera</h3>
            <div class="game-info">
              <p>Código da Partida: <strong id="game-code-display"></strong></p>
              <button onclick="lobby.copyGameCode()" class="secondary-btn">Copiar Código</button>
            </div>
            
            <div class="players-list">
              <h4>Jogadores (<span id="player-count">0</span>/<span id="max-player-count">4</span>)</h4>
              <div id="players-container"></div>
            </div>

            <div class="faction-selection">
              <h4>Escolha sua Facção:</h4>
              <div class="faction-grid" id="faction-grid">
                <!-- Facções serão adicionadas dinamicamente -->
              </div>
            </div>

            <div class="chat-container">
              <div id="chat-messages" class="chat-messages"></div>
              <div class="chat-input-group">
                <input type="text" id="chat-input" placeholder="Digite uma mensagem..." />
                <button onclick="lobby.sendMessage()">Enviar</button>
              </div>
            </div>

            <div class="button-group">
              <button id="start-game-btn" onclick="lobby.startGame()" class="primary-btn" style="display: none;">
                Iniciar Partida
              </button>
              <button onclick="lobby.leaveGame()" class="secondary-btn">Sair da Partida</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Criar estilos CSS
  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .lobby-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(10px);
      }

      .lobby-content {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 20px;
        padding: 30px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 2px solid #0f3460;
      }

      .lobby-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #0f3460;
      }

      .lobby-header h2 {
        color: #e94560;
        font-size: 2em;
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        color: #f47068;
        font-size: 2em;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .close-btn:hover {
        transform: scale(1.2);
      }

      .lobby-section {
        animation: fadeIn 0.3s ease-out;
      }

      .input-group {
        display: flex;
        gap: 10px;
        margin: 20px 0;
      }

      .input-group input {
        flex: 1;
        padding: 12px;
        border: 2px solid #0f3460;
        border-radius: 8px;
        background: #16213e;
        color: white;
        font-size: 16px;
      }

      .primary-btn, .secondary-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      }

      .primary-btn {
        background: linear-gradient(135deg, #e94560 0%, #f47068 100%);
        color: white;
      }

      .primary-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(233, 69, 96, 0.3);
      }

      .secondary-btn {
        background: #0f3460;
        color: white;
        border: 2px solid #1e5f8e;
      }

      .secondary-btn:hover {
        background: #1e5f8e;
      }

      .menu-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }

      .menu-btn {
        padding: 30px;
        border: 2px solid #0f3460;
        border-radius: 15px;
        background: #16213e;
        color: white;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
      }

      .menu-btn:hover {
        transform: translateY(-5px);
        border-color: #e94560;
        box-shadow: 0 10px 20px rgba(233, 69, 96, 0.2);
      }

      .menu-btn .icon {
        display: block;
        font-size: 3em;
        margin-bottom: 10px;
      }

      .player-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #0f3460;
        border-radius: 10px;
        margin-bottom: 20px;
      }

      .game-settings {
        display: grid;
        gap: 20px;
        margin: 20px 0;
      }

      .setting-group {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .setting-group label {
        color: #c7d0e7;
        font-weight: bold;
      }

      .setting-group select {
        padding: 8px 16px;
        border: 2px solid #0f3460;
        border-radius: 6px;
        background: #16213e;
        color: white;
        cursor: pointer;
      }

      .games-list {
        max-height: 400px;
        overflow-y: auto;
        margin: 20px 0;
      }

      .game-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        margin: 10px 0;
        background: #16213e;
        border: 2px solid #0f3460;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .game-item:hover {
        border-color: #e94560;
        transform: translateX(5px);
      }

      .game-info {
        background: #0f3460;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: center;
      }

      .players-list {
        background: #16213e;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
      }

      .player-item {
        display: flex;
        align-items: center;
        padding: 10px;
        margin: 5px 0;
        background: #0f3460;
        border-radius: 8px;
      }

      .faction-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin: 20px 0;
      }

      .faction-option {
        padding: 15px;
        border: 2px solid #0f3460;
        border-radius: 10px;
        background: #16213e;
        cursor: pointer;
        transition: all 0.3s;
      }

      .faction-option:hover {
        border-color: #e94560;
      }

      .faction-option.selected {
        border-color: #f47068;
        background: #1e5f8e;
      }

      .chat-container {
        background: #16213e;
        border-radius: 10px;
        padding: 15px;
        margin: 20px 0;
      }

      .chat-messages {
        height: 200px;
        overflow-y: auto;
        padding: 10px;
        background: #0f3460;
        border-radius: 8px;
        margin-bottom: 10px;
      }

      .chat-input-group {
        display: flex;
        gap: 10px;
      }

      .chat-input-group input {
        flex: 1;
        padding: 8px;
        border: 2px solid #0f3460;
        border-radius: 6px;
        background: #1a1a2e;
        color: white;
      }

      .button-group {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Inicializar
  init() {
    // Criar container
    const div = document.createElement('div');
    div.innerHTML = this.createHTML();
    document.body.appendChild(div);
    this.container = document.getElementById('lobby-container');
    
    // Adicionar estilos
    this.createStyles();
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Esconder inicialmente
    this.hide();
  }

  // Configurar event listeners
  setupEventListeners() {
    // Enter para login
    document.getElementById('username-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.login();
    });
    
    // Enter para código de partida
    document.getElementById('game-code-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.joinGame();
    });
    
    // Enter para chat
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Eventos do multiplayer
    window.addEventListener('playersUpdate', (e) => this.updatePlayersList(e.detail));
    window.addEventListener('gameUpdate', (e) => this.updateGameState(e.detail));
    window.addEventListener('chatMessage', (e) => this.addChatMessage(e.detail));
  }

  // Mostrar lobby
  show() {
    this.container.style.display = 'flex';
    this.isVisible = true;
    
    // Verificar se já está logado
    const state = multiplayer.getMultiplayerState();
    if (state.currentPlayer) {
      this.showMenu();
    } else {
      this.showLogin();
    }
  }

  // Esconder lobby
  hide() {
    this.container.style.display = 'none';
    this.isVisible = false;
    this.stopRefresh();
  }

  // Mostrar seções
  showSection(sectionId) {
    document.querySelectorAll('.lobby-section').forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
  }

  showLogin() {
    this.showSection('login-section');
  }

  showMenu() {
    this.showSection('menu-section');
    const state = multiplayer.getMultiplayerState();
    if (state.currentPlayer) {
      document.getElementById('player-name').textContent = state.currentPlayer.username;
    }
  }

  showCreateGame() {
    this.showSection('create-section');
  }

  showJoinGame() {
    this.showSection('join-section');
  }

  showFindGames() {
    this.showSection('games-list-section');
    this.loadGamesList();
  }

  showWaitingRoom() {
    this.showSection('waiting-room-section');
    this.loadFactions();
    this.startRefresh();
  }

  // Login
  async login() {
    const username = document.getElementById('username-input').value.trim();
    if (!username) {
      alert('Por favor, digite seu nome de jogador');
      return;
    }

    try {
      await multiplayer.initMultiplayer();
      await multiplayer.loginAnonymously(username);
      this.showMenu();
    } catch (error) {
      alert('Erro ao fazer login: ' + error.message);
    }
  }

  // Logout
  async logout() {
    await multiplayer.disconnect();
    this.showLogin();
  }

  // Criar partida
  async createGame() {
    const settings = {
      mode: document.getElementById('game-mode').value,
      maxPlayers: parseInt(document.getElementById('max-players').value),
      difficulty: document.getElementById('difficulty').value
    };

    try {
      const game = await multiplayer.createGame(settings);
      this.showWaitingRoom();
      document.getElementById('game-code-display').textContent = game.code;
      document.getElementById('max-player-count').textContent = settings.maxPlayers;
      document.getElementById('start-game-btn').style.display = 'block';
    } catch (error) {
      alert('Erro ao criar partida: ' + error.message);
    }
  }

  // Entrar em partida
  async joinGame() {
    const code = document.getElementById('game-code-input').value.trim();
    if (!code) {
      alert('Por favor, digite o código da partida');
      return;
    }

    try {
      await multiplayer.joinGame(code);
      this.showWaitingRoom();
      const state = multiplayer.getMultiplayerState();
      document.getElementById('game-code-display').textContent = state.currentGame.code;
    } catch (error) {
      alert('Erro ao entrar na partida: ' + error.message);
    }
  }

  // Carregar lista de partidas
  async loadGamesList() {
    const container = document.getElementById('games-list');
    container.innerHTML = '<div class="loading">Carregando partidas...</div>';

    try {
      const games = await multiplayer.findGames();
      
      if (games.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #c7d0e7;">Nenhuma partida disponível</p>';
        return;
      }

      container.innerHTML = games.map(game => `
        <div class="game-item" onclick="lobby.joinGameById('${game.code}')">
          <div>
            <strong>${game.creator.username}</strong>
            <br>
            <small>Modo: ${game.settings.mode} | ${game.game_players[0].count}/${game.settings.maxPlayers} jogadores</small>
          </div>
          <button class="secondary-btn">Entrar</button>
        </div>
      `).join('');
    } catch (error) {
      container.innerHTML = '<p style="text-align: center; color: #f47068;">Erro ao carregar partidas</p>';
    }
  }

  // Entrar em partida por ID
  async joinGameById(code) {
    document.getElementById('game-code-input').value = code;
    await this.joinGame();
  }

  // Carregar facções
  loadFactions() {
    const factions = [
      { id: 'heart', name: 'Coração Cristalino', color: '#e74c3c' },
      { id: 'forge', name: 'Forjadores do Núcleo', color: '#f39c12' },
      { id: 'scribe', name: 'Escribas dos Estratos', color: '#3498db' },
      { id: 'prospect', name: 'Prospeccionistas Gnômicos', color: '#2ecc71' }
    ];

    const container = document.getElementById('faction-grid');
    container.innerHTML = factions.map(faction => `
      <div class="faction-option" data-faction="${faction.id}" onclick="lobby.selectFaction('${faction.id}')" style="border-color: ${faction.color};">
        <strong style="color: ${faction.color};">${faction.name}</strong>
      </div>
    `).join('');
  }

  // Selecionar facção
  async selectFaction(factionId) {
    document.querySelectorAll('.faction-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    document.querySelector(`[data-faction="${factionId}"]`).classList.add('selected');

    // Atualizar no servidor
    const state = multiplayer.getMultiplayerState();
    if (state.currentGame) {
      await multiplayer.sendGameAction('selectFaction', { faction: factionId });
    }
  }

  // Copiar código da partida
  copyGameCode() {
    const code = document.getElementById('game-code-display').textContent;
    navigator.clipboard.writeText(code);
    alert('Código copiado: ' + code);
  }

  // Enviar mensagem no chat
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    await multiplayer.sendChatMessage(message);
    input.value = '';
  }

  // Adicionar mensagem ao chat
  addChatMessage(data) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.style.margin = '5px 0';
    messageDiv.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }

  // Atualizar lista de jogadores
  updatePlayersList(data) {
    // Implementar atualização da lista de jogadores
  }

  // Atualizar estado do jogo
  updateGameState(data) {
    if (data.status === 'playing') {
      // Iniciar o jogo
      this.hide();
      window.dispatchEvent(new CustomEvent('startMultiplayerGame', { detail: data }));
    }
  }

  // Iniciar partida
  async startGame() {
    try {
      await multiplayer.startGame();
    } catch (error) {
      alert('Erro ao iniciar partida: ' + error.message);
    }
  }

  // Sair da partida
  async leaveGame() {
    await multiplayer.leaveGame();
    this.showMenu();
    this.stopRefresh();
  }

  // Iniciar atualização automática
  startRefresh() {
    this.refreshInterval = setInterval(() => {
      // Atualizar lista de jogadores
      // Implementar lógica de refresh
    }, 2000);
  }

  // Parar atualização automática
  stopRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

// Criar instância global
window.lobby = new LobbyUI();

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
  window.lobby.init();
});

export default LobbyUI;