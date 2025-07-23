// Sistema de Multiplayer para Mestre das Rochas (Versão Segura)
const { createClient } = window.supabase;

// Configuração do Supabase - usar variáveis de ambiente em produção
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || process.env.SUPABASE_ANON_KEY;

const REALTIME_CHANNELS = {
  game: (gameId) => `game:${gameId}`,
  lobby: 'lobby',
  chat: (gameId) => `chat:${gameId}`
};

// Cliente Supabase
let supabase = null;

// Estado do multiplayer
const multiplayerState = {
  isOnline: false,
  currentGame: null,
  currentPlayer: null,
  players: [],
  gameChannel: null,
  chatChannel: null
};

// Inicializar Supabase
export function initMultiplayer() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Configuração do Supabase não encontrada');
    return null;
  }
  
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  
  return supabase;
}

// Sistema de autenticação
export async function loginAnonymously(username) {
  try {
    // Login anônimo
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    if (authError) throw authError;

    // Criar/atualizar perfil do jogador
    const { data: player, error: playerError } = await supabase
      .from('players')
      .upsert({
        id: authData.user.id,
        username: username,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (playerError) throw playerError;

    multiplayerState.currentPlayer = player;
    multiplayerState.isOnline = true;
    
    return player;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

// Criar nova partida
export async function createGame(settings = {}) {
  try {
    const { data: game, error } = await supabase
      .from('games')
      .insert({
        created_by: multiplayerState.currentPlayer.id,
        settings: {
          mode: settings.mode || 'competitive',
          difficulty: settings.difficulty || 'normal',
          maxPlayers: settings.maxPlayers || 4
        },
        game_state: {
          phase: 'waiting',
          round: 0,
          board: null,
          market: null
        }
      })
      .select()
      .single();

    if (error) throw error;

    // Entrar automaticamente na partida criada
    await joinGame(game.code);
    
    return game;
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    throw error;
  }
}

// Entrar em partida existente
export async function joinGame(gameCode) {
  try {
    // Buscar partida pelo código
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('code', gameCode.toUpperCase())
      .single();

    if (gameError) throw new Error('Partida não encontrada');
    if (game.status !== 'waiting') throw new Error('Partida já iniciada');

    // Verificar se já está na partida
    const { data: existingPlayer } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', game.id)
      .eq('player_id', multiplayerState.currentPlayer.id)
      .single();

    if (!existingPlayer) {
      // Adicionar jogador à partida
      const { data: gamePlayer, error: joinError } = await supabase
        .from('game_players')
        .insert({
          game_id: game.id,
          player_id: multiplayerState.currentPlayer.id,
          position: await getNextPosition(game.id)
        })
        .select()
        .single();

      if (joinError) throw joinError;
    }

    multiplayerState.currentGame = game;
    
    // Conectar aos canais em tempo real
    await connectToGameChannels(game.id);
    
    return game;
  } catch (error) {
    console.error('Erro ao entrar na partida:', error);
    throw error;
  }
}

// Obter próxima posição disponível
async function getNextPosition(gameId) {
  const { count } = await supabase
    .from('game_players')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);
  
  return (count || 0) + 1;
}

// Conectar aos canais de tempo real
async function connectToGameChannels(gameId) {
  // Canal do jogo
  multiplayerState.gameChannel = supabase
    .channel(REALTIME_CHANNELS.game(gameId))
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'game_actions',
      filter: `game_id=eq.${gameId}`
    }, handleGameAction)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'game_players',
      filter: `game_id=eq.${gameId}`
    }, handlePlayerUpdate)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'games',
      filter: `id=eq.${gameId}`
    }, handleGameUpdate)
    .subscribe();

  // Canal de chat
  multiplayerState.chatChannel = supabase
    .channel(REALTIME_CHANNELS.chat(gameId))
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'game_chat',
      filter: `game_id=eq.${gameId}`
    }, handleChatMessage)
    .subscribe();
}

// Handlers de eventos em tempo real
function handleGameAction(payload) {
  const action = payload.new;
  
  // Emitir evento customizado para o jogo processar
  window.dispatchEvent(new CustomEvent('multiplayerAction', {
    detail: {
      type: action.action_type,
      data: action.action_data,
      playerId: action.player_id
    }
  }));
}

function handlePlayerUpdate(payload) {
  window.dispatchEvent(new CustomEvent('playersUpdate', {
    detail: payload
  }));
}

function handleGameUpdate(payload) {
  multiplayerState.currentGame = payload.new;
  window.dispatchEvent(new CustomEvent('gameUpdate', {
    detail: payload.new
  }));
}

function handleChatMessage(payload) {
  window.dispatchEvent(new CustomEvent('chatMessage', {
    detail: payload.new
  }));
}

// Enviar ação do jogo
export async function sendGameAction(actionType, actionData) {
  if (!multiplayerState.currentGame) return;

  try {
    const { error } = await supabase
      .from('game_actions')
      .insert({
        game_id: multiplayerState.currentGame.id,
        player_id: multiplayerState.currentPlayer.id,
        action_type: actionType,
        action_data: actionData
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao enviar ação:', error);
  }
}

// Enviar mensagem no chat
export async function sendChatMessage(message) {
  if (!multiplayerState.currentGame) return;

  try {
    const { error } = await supabase
      .from('game_chat')
      .insert({
        game_id: multiplayerState.currentGame.id,
        player_id: multiplayerState.currentPlayer.id,
        message: message
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

// Iniciar partida (apenas criador)
export async function startGame() {
  if (!multiplayerState.currentGame) return;
  if (multiplayerState.currentGame.created_by !== multiplayerState.currentPlayer.id) {
    throw new Error('Apenas o criador pode iniciar a partida');
  }

  try {
    // Buscar todos os jogadores
    const { data: players } = await supabase
      .from('game_players')
      .select('*, player:players(*)')
      .eq('game_id', multiplayerState.currentGame.id)
      .order('position');

    // Gerar estado inicial do jogo
    const initialGameState = generateInitialGameState(players);

    // Atualizar status do jogo
    const { error } = await supabase
      .from('games')
      .update({
        status: 'playing',
        started_at: new Date().toISOString(),
        game_state: initialGameState
      })
      .eq('id', multiplayerState.currentGame.id);

    if (error) throw error;

    return initialGameState;
  } catch (error) {
    console.error('Erro ao iniciar partida:', error);
    throw error;
  }
}

// Gerar estado inicial do jogo
function generateInitialGameState(players) {
  return {
    phase: 'exploration',
    round: 1,
    currentPlayerIndex: 0,
    players: players.map(p => ({
      id: p.player_id,
      username: p.player.username,
      faction: p.faction,
      position: p.position,
      resources: {
        energy: 10,
        points: 0,
        fragments: 0,
        coins: 5,
        minerals: {}
      },
      genies: [],
      golems: []
    })),
    board: generateHexBoard(),
    market: {
      talco: 2,
      quartzo: 5,
      corindo: 10,
      magnetita: 6,
      hackmanita: 7
    },
    events: [],
    turnOrder: shuffleArray(players.map(p => p.player_id))
  };
}

// Gerar tabuleiro hexagonal
function generateHexBoard() {
  const board = [];
  const size = 7;
  
  for (let q = -3; q <= 3; q++) {
    for (let r = Math.max(-3, -q - 3); r <= Math.min(3, -q + 3); r++) {
      board.push({
        q, r,
        s: -q - r,
        terrain: 'unexplored',
        resource: null,
        owner: null,
        golem: null
      });
    }
  }
  
  return board;
}

// Utilitário para embaralhar array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sair da partida
export async function leaveGame() {
  if (!multiplayerState.currentGame) return;

  try {
    // Remover jogador da partida
    await supabase
      .from('game_players')
      .delete()
      .eq('game_id', multiplayerState.currentGame.id)
      .eq('player_id', multiplayerState.currentPlayer.id);

    // Desconectar dos canais
    if (multiplayerState.gameChannel) {
      await multiplayerState.gameChannel.unsubscribe();
    }
    if (multiplayerState.chatChannel) {
      await multiplayerState.chatChannel.unsubscribe();
    }

    multiplayerState.currentGame = null;
    multiplayerState.gameChannel = null;
    multiplayerState.chatChannel = null;
  } catch (error) {
    console.error('Erro ao sair da partida:', error);
  }
}

// Buscar partidas disponíveis
export async function findGames(filter = {}) {
  try {
    let query = supabase
      .from('games')
      .select(`
        *,
        game_players(count),
        creator:players!games_created_by_fkey(username)
      `)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: games, error } = await query;

    if (error) throw error;

    return games;
  } catch (error) {
    console.error('Erro ao buscar partidas:', error);
    return [];
  }
}

// Obter estado do multiplayer
export function getMultiplayerState() {
  return multiplayerState;
}

// Verificar se está online
export function isOnline() {
  return multiplayerState.isOnline;
}

// Desconectar
export async function disconnect() {
  if (multiplayerState.gameChannel) {
    await multiplayerState.gameChannel.unsubscribe();
  }
  if (multiplayerState.chatChannel) {
    await multiplayerState.chatChannel.unsubscribe();
  }
  
  if (supabase) {
    await supabase.auth.signOut();
  }
  
  multiplayerState.isOnline = false;
  multiplayerState.currentGame = null;
  multiplayerState.currentPlayer = null;
}

export default {
  initMultiplayer,
  loginAnonymously,
  createGame,
  joinGame,
  startGame,
  sendGameAction,
  sendChatMessage,
  leaveGame,
  findGames,
  getMultiplayerState,
  isOnline,
  disconnect
};