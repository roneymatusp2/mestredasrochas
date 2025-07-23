-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de jogadores
CREATE TABLE IF NOT EXISTS players (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  email text unique,
  created_at timestamp with time zone default now(),
  stats jsonb default '{"wins": 0, "games_played": 0, "favorite_faction": null}',
  achievements jsonb default '[]',
  settings jsonb default '{"sound": true, "music": true, "language": "pt-BR"}'
);

-- Criar tabela de partidas
CREATE TABLE IF NOT EXISTS games (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  status text not null default 'waiting',
  max_players integer default 4,
  created_by uuid references players(id),
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  game_state jsonb,
  settings jsonb default '{"mode": "competitive", "difficulty": "normal"}'
);

-- Criar tabela de jogadores em partidas
CREATE TABLE IF NOT EXISTS game_players (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id),
  faction text,
  position integer,
  is_ready boolean default false,
  is_active boolean default true,
  score integer default 0,
  resources jsonb default '{}',
  joined_at timestamp with time zone default now()
);

-- Criar tabela de ações do jogo
CREATE TABLE IF NOT EXISTS game_actions (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id),
  action_type text not null,
  action_data jsonb not null,
  created_at timestamp with time zone default now(),
  processed boolean default false
);

-- Criar tabela de chat do jogo
CREATE TABLE IF NOT EXISTS game_chat (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id),
  message text not null,
  created_at timestamp with time zone default now()
);

-- Criar tabela de rankings
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references players(id),
  faction text,
  score integer not null,
  game_duration interval,
  game_mode text,
  created_at timestamp with time zone default now()
);

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

-- Habilitar RLS (Row Level Security)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Políticas para players
CREATE POLICY "Permitir leitura pública de jogadores" ON players
  FOR SELECT USING (true);

CREATE POLICY "Permitir insert para usuários autenticados" ON players
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir update apenas para o próprio jogador" ON players
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para games
CREATE POLICY "Permitir leitura pública de partidas" ON games
  FOR SELECT USING (true);

CREATE POLICY "Permitir criar partidas para autenticados" ON games
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir update para criador ou partidas em espera" ON games
  FOR UPDATE USING (auth.uid() = created_by OR status = 'waiting');

-- Políticas para game_players
CREATE POLICY "Permitir leitura pública de jogadores em partidas" ON game_players
  FOR SELECT USING (true);

CREATE POLICY "Permitir entrar em partidas" ON game_players
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Permitir update próprio" ON game_players
  FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "Permitir sair da partida" ON game_players
  FOR DELETE USING (auth.uid() = player_id);

-- Políticas para game_actions
CREATE POLICY "Permitir leitura de ações da partida" ON game_actions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM game_players 
    WHERE game_players.game_id = game_actions.game_id 
    AND game_players.player_id = auth.uid()
  ));

CREATE POLICY "Permitir insert de ações próprias" ON game_actions
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Políticas para game_chat
CREATE POLICY "Permitir leitura de chat da partida" ON game_chat
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM game_players 
    WHERE game_players.game_id = game_chat.game_id 
    AND game_players.player_id = auth.uid()
  ));

CREATE POLICY "Permitir enviar mensagens" ON game_chat
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Políticas para leaderboard
CREATE POLICY "Permitir leitura pública do ranking" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Sistema pode inserir rankings" ON leaderboard
  FOR INSERT WITH CHECK (true);

-- Função para atualizar estatísticas do jogador após partida
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas do jogador
  UPDATE players
  SET stats = jsonb_set(
    jsonb_set(
      stats,
      '{games_played}',
      to_jsonb((stats->>'games_played')::int + 1)
    ),
    '{wins}',
    to_jsonb(
      CASE 
        WHEN NEW.score = (
          SELECT MAX(score) 
          FROM game_players 
          WHERE game_id = NEW.game_id
        ) 
        THEN (stats->>'wins')::int + 1 
        ELSE (stats->>'wins')::int 
      END
    )
  )
  WHERE id = NEW.player_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas quando partida termina
CREATE TRIGGER trigger_update_player_stats
AFTER UPDATE ON game_players
FOR EACH ROW
WHEN (OLD.score IS DISTINCT FROM NEW.score)
EXECUTE FUNCTION update_player_stats();