// Configuração do Supabase para Mestre das Rochas (Versão Segura)
// Use variáveis de ambiente em produção

export const SUPABASE_URL = process.env.SUPABASE_URL || window.SUPABASE_CONFIG?.url;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || window.SUPABASE_CONFIG?.anonKey;

// Estrutura das tabelas necessárias para o jogo
export const DATABASE_SCHEMA = {
  // Tabela de jogadores
  players: {
    id: 'uuid primary key default uuid_generate_v4()',
    username: 'text unique not null',
    email: 'text unique',
    created_at: 'timestamp with time zone default now()',
    stats: 'jsonb default \'{"wins": 0, "games_played": 0, "favorite_faction": null}\'',
    achievements: 'jsonb default \'[]\'',
    settings: 'jsonb default \'{"sound": true, "music": true, "language": "pt-BR"}\''
  },

  // Tabela de partidas
  games: {
    id: 'uuid primary key default uuid_generate_v4()',
    code: 'text unique not null', // Código de 6 caracteres para entrar na partida
    status: 'text not null default \'waiting\'', // waiting, playing, finished
    max_players: 'integer default 4',
    created_by: 'uuid references players(id)',
    created_at: 'timestamp with time zone default now()',
    started_at: 'timestamp with time zone',
    finished_at: 'timestamp with time zone',
    game_state: 'jsonb', // Estado completo do jogo
    settings: 'jsonb default \'{"mode": "competitive", "difficulty": "normal"}\''
  },

  // Tabela de jogadores em partidas
  game_players: {
    id: 'uuid primary key default uuid_generate_v4()',
    game_id: 'uuid references games(id) on delete cascade',
    player_id: 'uuid references players(id)',
    faction: 'text',
    position: 'integer', // Ordem do jogador
    is_ready: 'boolean default false',
    is_active: 'boolean default true',
    score: 'integer default 0',
    resources: 'jsonb default \'{}\'',
    joined_at: 'timestamp with time zone default now()'
  },

  // Tabela de ações do jogo (para sincronização em tempo real)
  game_actions: {
    id: 'uuid primary key default uuid_generate_v4()',
    game_id: 'uuid references games(id) on delete cascade',
    player_id: 'uuid references players(id)',
    action_type: 'text not null',
    action_data: 'jsonb not null',
    created_at: 'timestamp with time zone default now()',
    processed: 'boolean default false'
  },

  // Tabela de chat do jogo
  game_chat: {
    id: 'uuid primary key default uuid_generate_v4()',
    game_id: 'uuid references games(id) on delete cascade',
    player_id: 'uuid references players(id)',
    message: 'text not null',
    created_at: 'timestamp with time zone default now()'
  },

  // Tabela de rankings
  leaderboard: {
    id: 'uuid primary key default uuid_generate_v4()',
    player_id: 'uuid references players(id)',
    faction: 'text',
    score: 'integer not null',
    game_duration: 'interval',
    game_mode: 'text',
    created_at: 'timestamp with time zone default now()'
  }
};

// Configuração de Realtime para sincronização
export const REALTIME_CHANNELS = {
  game: (gameId) => `game:${gameId}`,
  lobby: 'lobby',
  chat: (gameId) => `chat:${gameId}`
};

// Políticas de segurança (RLS)
export const RLS_POLICIES = {
  players: {
    'Enable read access for all users': 'SELECT',
    'Enable insert for authenticated users only': 'INSERT WITH CHECK (auth.uid() = id)',
    'Enable update for users based on id': 'UPDATE USING (auth.uid() = id)'
  },
  games: {
    'Enable read access for all users': 'SELECT',
    'Enable insert for authenticated users': 'INSERT WITH CHECK (auth.uid() IS NOT NULL)',
    'Enable update for game creator': 'UPDATE USING (auth.uid() = created_by OR status = \'waiting\')'
  },
  game_players: {
    'Enable read access for all users': 'SELECT',
    'Enable insert for authenticated users': 'INSERT WITH CHECK (auth.uid() = player_id)',
    'Enable update for player': 'UPDATE USING (auth.uid() = player_id)',
    'Enable delete for player': 'DELETE USING (auth.uid() = player_id)'
  }
};

// Função para inicializar o Supabase
export async function initSupabase() {
  // Este script será executado no Supabase para criar as tabelas
  const initScript = `
    -- Habilitar extensão UUID
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Criar tabelas
    ${Object.entries(DATABASE_SCHEMA).map(([tableName, columns]) => `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${Object.entries(columns).map(([col, type]) => `${col} ${type}`).join(',\n      ')}
    );`).join('\n')}

    -- Criar índices para otimização
    CREATE INDEX IF NOT EXISTS idx_games_code ON games(code);
    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
    CREATE INDEX IF NOT EXISTS idx_game_actions_game_id ON game_actions(game_id);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);

    -- Função para gerar código de jogo único
    CREATE OR REPLACE FUNCTION generate_game_code()
    RETURNS TEXT AS $$
    DECLARE
      code TEXT;
      exists BOOLEAN;
    BEGIN
      LOOP
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
        SELECT EXISTS(SELECT 1 FROM games WHERE games.code = code) INTO exists;
        EXIT WHEN NOT exists;
      END LOOP;
      RETURN code;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger para gerar código automaticamente
    CREATE OR REPLACE FUNCTION set_game_code()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.code := generate_game_code();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_set_game_code
    BEFORE INSERT ON games
    FOR EACH ROW
    WHEN (NEW.code IS NULL)
    EXECUTE FUNCTION set_game_code();
  `;

  return initScript;
}

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DATABASE_SCHEMA,
  REALTIME_CHANNELS,
  RLS_POLICIES,
  initSupabase
};