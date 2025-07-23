# 🤝 Guia de Contribuição - Mestre das Rochas

Obrigado por considerar contribuir com o **Mestre das Rochas**! Este documento contém diretrizes para ajudar você a contribuir de forma efetiva.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Documentação](#documentação)
- [Processo de Pull Request](#processo-de-pull-request)

## 📜 Código de Conduta

Este projeto segue o [Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

### Nossos Compromissos

- Usar linguagem acolhedora e inclusiva
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas com elegância
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

## 🚀 Como Posso Contribuir?

### 🐛 Reportando Bugs

Antes de reportar um bug:

1. **Verifique** se o bug já foi reportado nas [Issues](https://github.com/roneymatusp2/mestre-das-rochas/issues)
2. **Teste** na versão mais recente
3. **Colete** informações sobre o ambiente (navegador, OS, versão)

**Template para Bug Report:**

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

**Comportamento Esperado**
Uma descrição clara do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente:**
- OS: [ex: Windows 10]
- Navegador: [ex: Chrome 91]
- Versão do Jogo: [ex: 1.0.0]

**Informações Adicionais**
Qualquer outro contexto sobre o problema.
```

### ✨ Sugerindo Melhorias

**Template para Feature Request:**

```markdown
**A melhoria está relacionada a um problema? Descreva.**
Uma descrição clara e concisa do problema.

**Descreva a solução que você gostaria**
Uma descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas consideradas**
Uma descrição clara de soluções ou recursos alternativos.

**Contexto adicional**
Qualquer outro contexto ou screenshots sobre a solicitação.
```

### 💻 Contribuindo com Código

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie** uma branch para sua feature
4. **Faça** suas alterações
5. **Teste** suas alterações
6. **Commit** seguindo nossos padrões
7. **Push** para sua branch
8. **Abra** um Pull Request

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 16+
- NPM 8+
- Git
- Editor de código (recomendamos VS Code)

### Instalação

```bash
# Clone seu fork
git clone https://github.com/SEU_USUARIO/mestre-das-rochas.git

# Entre no diretório
cd mestre-das-rochas

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

### Extensões Recomendadas (VS Code)

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag"
  ]
}
```

## 🔧 Processo de Desenvolvimento

### Branches

- `main` - Branch principal (sempre estável)
- `develop` - Branch de desenvolvimento
- `feature/nome-da-feature` - Novas funcionalidades
- `bugfix/nome-do-bug` - Correções de bugs
- `hotfix/nome-do-hotfix` - Correções urgentes

### Workflow

```bash
# Atualize sua branch main
git checkout main
git pull upstream main

# Crie uma nova branch
git checkout -b feature/minha-nova-feature

# Faça suas alterações
# ... código ...

# Commit suas alterações
git add .
git commit -m "feat: adiciona nova funcionalidade X"

# Push para seu fork
git push origin feature/minha-nova-feature

# Abra um Pull Request no GitHub
```

## 📏 Padrões de Código

### JavaScript

- Use **ES6+** features
- Prefira **const** e **let** ao invés de **var**
- Use **arrow functions** quando apropriado
- Mantenha funções pequenas e focadas
- Use **JSDoc** para documentar funções complexas

```javascript
/**
 * Calcula o custo de lapidação baseado na dureza Mohs
 * @param {string} mineral - Nome do mineral
 * @param {string} faction - Facção do jogador
 * @returns {number} Custo em energia
 */
const calculateLapidationCost = (mineral, faction) => {
    const baseCost = Math.ceil(MINERALS[mineral].mohs / 2);
    return applyFactionBonus(baseCost, faction);
};
```

### CSS

- Use **variáveis CSS** para cores e espaçamentos
- Prefira **Grid** e **Flexbox** para layouts
- Use **BEM** methodology para classes
- Mantenha especificidade baixa

```css
/* ✅ Bom */
.game-board__hex-tile {
    background: var(--primary-bg);
    border-radius: var(--border-radius);
}

/* ❌ Evite */
.game .board .hex.tile {
    background: #0a0a1a;
    border-radius: 8px;
}
```

### HTML

- Use **HTML5 semântico**
- Inclua **atributos de acessibilidade**
- Mantenha estrutura limpa e organizada

```html
<!-- ✅ Bom -->
<button 
    class="action-btn" 
    data-action="explore" 
    aria-label="Explorar território"
    data-tooltip="Explore novos hexágonos (Tecla 1)">
    <i class="fas fa-search" aria-hidden="true"></i>
    <span>Explorar</span>
</button>
```

### Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos:**
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Mudanças na documentação
- `style` - Formatação, ponto e vírgula, etc
- `refactor` - Refatoração de código
- `test` - Adição ou correção de testes
- `chore` - Tarefas de manutenção

**Exemplos:**
```bash
git commit -m "feat: adiciona sistema de conquistas"
git commit -m "fix: corrige bug na lapidação de quartzo"
git commit -m "docs: atualiza README com novas instruções"
```

## 🧪 Testes

### Executando Testes

```bash
# Executa todos os testes
npm test

# Executa testes em modo watch
npm run test:watch

# Gera relatório de cobertura
npm run test:coverage
```

### Escrevendo Testes

```javascript
// tests/game.test.js
describe('GameState', () => {
    test('should initialize with correct default values', () => {
        const state = new GameState();
        
        expect(state.energy).toBe(10);
        expect(state.round).toBe(1);
        expect(state.phase).toBe(1);
    });
    
    test('should apply faction bonus correctly', () => {
        const state = new GameState();
        state.applyFactionBonus('Forjadores do Núcleo');
        
        expect(state.energy).toBe(13);
        expect(state.maxEnergy).toBe(13);
    });
});
```

## 📚 Documentação

### JSDoc

Use JSDoc para documentar funções, classes e métodos:

```javascript
/**
 * Representa o estado do jogo
 * @class
 */
class GameState {
    /**
     * Cria uma nova instância do estado do jogo
     * @constructor
     */
    constructor() {
        // ...
    }
    
    /**
     * Aplica bônus da facção selecionada
     * @param {string} faction - Nome da facção
     * @throws {Error} Se a facção não existir
     */
    applyFactionBonus(faction) {
        // ...
    }
}
```

### README

- Mantenha o README atualizado
- Inclua exemplos de uso
- Documente mudanças na API
- Use screenshots quando apropriado

## 🔄 Processo de Pull Request

### Antes de Submeter

- [ ] Código segue os padrões estabelecidos
- [ ] Testes passam (`npm test`)
- [ ] Lint passa (`npm run lint`)
- [ ] Documentação foi atualizada
- [ ] Commit messages seguem o padrão
- [ ] Branch está atualizada com main

### Template de PR

```markdown
## 📝 Descrição

Breve descrição das mudanças realizadas.

## 🔄 Tipo de Mudança

- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## 🧪 Como Foi Testado?

Descreva os testes realizados para verificar suas mudanças.

## 📋 Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Realizei uma auto-revisão do código
- [ ] Comentei código em áreas complexas
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção/feature funciona
- [ ] Testes novos e existentes passam localmente

## 📷 Screenshots (se aplicável)

Adicione screenshots para demonstrar as mudanças visuais.
```

### Revisão

Todos os PRs passam por revisão:

1. **Revisão Automática** - CI/CD checks
2. **Revisão por Pares** - Pelo menos 1 aprovação
3. **Testes** - Todos os testes devem passar
4. **Merge** - Squash and merge para manter histórico limpo

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** - Mudanças incompatíveis na API
- **MINOR** - Funcionalidades adicionadas de forma compatível
- **PATCH** - Correções de bugs compatíveis

## 🎯 Áreas de Contribuição

### 🔥 Prioridade Alta
- Correções de bugs críticos
- Melhorias de performance
- Acessibilidade
- Testes automatizados

### 🌟 Prioridade Média
- Novas funcionalidades
- Melhorias na UI/UX
- Documentação
- Internacionalização

### 💡 Prioridade Baixa
- Refatorações
- Otimizações menores
- Linting e formatação

## 🆘 Precisa de Ajuda?

- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/mestre-das-rochas)
- 📧 **Email**: contato@mestredasrochas.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/roneymatusp2/mestre-das-rochas/issues)
- 💡 **Discussões**: [GitHub Discussions](https://github.com/roneymatusp2/mestre-das-rochas/discussions)

## 🙏 Reconhecimento

Todos os contribuidores são reconhecidos no README e releases. Obrigado por tornar o **Mestre das Rochas** ainda melhor!

---

*Este guia de contribuição é um documento vivo e pode ser atualizado conforme o projeto evolui.*
