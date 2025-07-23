# 🎮 Mestre das Rochas - O Chamado dos Gênios

<p align="center">
  <img src="assets/logo.png" alt="Mestre das Rochas Logo" width="200"/>
</p>

<p align="center">
  <strong>Versão Ônix Suprema</strong><br>
  Um jogo de estratégia épico que funde geologia real com fantasia elemental
</p>

<p align="center">
  <a href="https://mestre-das-rochas.netlify.app">🌐 Jogar Online</a> •
  <a href="#recursos">✨ Recursos</a> •
  <a href="#instalação">🚀 Instalação</a> •
  <a href="#multiplayer">🌍 Multiplayer</a> •
  <a href="#contribuindo">🤝 Contribuindo</a>
</p>

---

## 📖 Sobre o Jogo

**Mestre das Rochas** é um jogo de estratégia hexagonal onde jogadores exploram as profundezas da terra, extraem minerais raros e invocam poderosos gênios elementais. Cada partida oferece uma experiência única com tabuleiro modular, eventos dinâmicos e múltiplas estratégias de vitória.

### 🎯 Características Principais

- **Tabuleiro Hexagonal Modular**: Cada partida é única com 49 hexágonos exploráveis
- **4 Facções Assimétricas**: Cada ordem possui habilidades e estratégias únicas
- **Sistema de Minerais Realista**: Baseado na escala de dureza Mohs
- **Gênios Elementais**: 11 famílias com poderes únicos
- **Multiplayer Online**: Jogue com amigos via Supabase
- **PWA**: Funciona offline após primeira visita

## ✨ Recursos

### 🎮 Mecânicas de Jogo

- **Exploração**: Descubra novos territórios e recursos
- **Extração**: Mine diferentes tipos de minerais
- **Lapidação**: Transforme pedras brutas em gemas valiosas
- **Invocação**: Convoque gênios poderosos para auxiliar sua estratégia
- **Controle de Golems**: Domine o território com suas criaturas
- **Mercado Dinâmico**: Preços flutuam baseados na oferta e demanda

### 🏛️ Facções

1. **Coração Cristalino** 💎
   - Mestres da lapidação
   - Bônus ao trabalhar pedras duras
   
2. **Forjadores do Núcleo** 🔥
   - Especialistas em terrenos vulcânicos
   - Golems mais baratos
   
3. **Escribas dos Estratos** 📚
   - Conhecimento é poder
   - Objetivos secretos extras
   
4. **Prospeccionistas Gnômicos** ⛏️
   - Extração eficiente
   - Rede logística superior

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ e npm 8+
- Conta no [Supabase](https://supabase.io) (para multiplayer)
- Conta no [Netlify](https://netlify.com) (para deploy)

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/roneymatusp2/mestredasrochas.git
cd mestredasrochas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves do Supabase

# Gere os assets (ícones PWA)
npm run build:icons

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000

### Build de Produção

```bash
# Gerar build otimizado
npm run build

# Deploy no Netlify
npm run deploy
```

## 🌍 Multiplayer

### Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.io)
2. Execute o script SQL em `supabase-init.sql` no SQL Editor
3. Copie as chaves do projeto para o arquivo `.env`

### Como Jogar Online

1. Clique em "Jogar Online" no menu principal
2. Escolha um nome de jogador
3. Crie uma sala ou entre com código
4. Aguarde outros jogadores
5. Escolha sua facção
6. Divirta-se!

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
mestre-das-rochas/
├── assets/           # Ícones e imagens
├── public/           # Arquivos estáticos
├── src/              # Código fonte
│   ├── game.js       # Lógica principal
│   ├── multiplayer.js # Sistema online
│   ├── lobby.js      # Interface multiplayer
│   └── styles.css    # Estilos
├── index.html        # Página principal
├── manifest.json     # PWA config
├── netlify.toml      # Deploy config
└── supabase-init.sql # Schema do banco
```

### Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run build:icons` - Gerar ícones PWA
- `npm run lint` - Verificar código
- `npm run test` - Executar testes
- `npm run deploy` - Deploy no Netlify

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Créditos

**Criado por:**
- Mohamed Hage
- Marcos Piniesky
- Roney Nascimento

**Tecnologias:**
- JavaScript/HTML5/CSS3
- Supabase (Backend)
- Netlify (Hosting)
- Particles.js (Efeitos)
- Howler.js (Áudio)

## 📞 Suporte

- 🐛 [Reportar Bug](https://github.com/roneymatusp2/mestredasrochas/issues)
- 💡 [Sugerir Feature](https://github.com/roneymatusp2/mestredasrochas/issues)
- 💬 [Discord](https://discord.gg/mestredasrochas)

---

<p align="center">
  Feito com ❤️ para amantes de jogos de estratégia e geologia
</p>