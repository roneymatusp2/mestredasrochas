# 🚀 Guia de Deploy - Mestre das Rochas

## 📋 Pré-Deploy Checklist

- [ ] Código testado localmente
- [ ] Assets gerados (ícones PWA)
- [ ] Supabase configurado com tabelas criadas
- [ ] Build de produção gerado
- [ ] Git atualizado com todas as mudanças

## 🔧 Configuração do Supabase

### 1. Criar Projeto
1. Acesse [app.supabase.io](https://app.supabase.io)
2. Clique em "New Project"
3. Configure:
   - Project name: `mestre-das-rochas`
   - Database Password: (guarde em local seguro)
   - Region: Escolha a mais próxima

### 2. Executar Script SQL
1. No painel do Supabase, vá em "SQL Editor"
2. Cole o conteúdo de `supabase-init.sql`
3. Execute o script
4. Verifique se todas as tabelas foram criadas

### 3. Configurar Autenticação
1. Vá em "Authentication" > "Providers"
2. Habilite "Anonymous Sign-ins"
3. Salve as configurações

## 🌐 Deploy no Netlify

### Opção 1: Via GitHub (Recomendado)

1. **Push para GitHub:**
   ```bash
   git add .
   git commit -m "Deploy: Mestre das Rochas v1.0.0"
   git push origin main
   ```

2. **Conectar Netlify:**
   - Acesse [app.netlify.com](https://app.netlify.com)
   - "Add new site" > "Import an existing project"
   - Conecte com GitHub
   - Selecione o repositório `mestredasrochas`

3. **Configurações de Build:**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Variáveis de Ambiente:**
   No Netlify, vá em "Site settings" > "Environment variables":
   ```
   SUPABASE_URL=https://gjvtncdjcslnkfctqnfy.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   ```

### Opção 2: Deploy Manual

1. **Gerar Build:**
   ```bash
   npm run build
   ```

2. **Deploy via CLI:**
   ```bash
   # Preview
   npm run deploy:preview
   
   # Produção
   npm run deploy
   ```

3. **Ou arraste a pasta `dist` para netlify.com/drop**

## 🔐 Segurança

### Configurar Headers
O arquivo `netlify.toml` já inclui headers de segurança:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### Domínio Customizado (Opcional)
1. Em Netlify > "Domain settings"
2. "Add custom domain"
3. Configure DNS conforme instruções

## 📊 Monitoramento

### Analytics
- Netlify Analytics (pago)
- Google Analytics (adicionar script em index.html)
- Supabase Dashboard para monitorar uso

### Logs
- Netlify Functions logs
- Supabase Logs para queries
- Browser console para erros client-side

## 🐛 Troubleshooting

### Erro: "Supabase connection failed"
- Verifique as chaves no Netlify env vars
- Confirme que o projeto Supabase está ativo
- Teste as chaves localmente primeiro

### Erro: "Build failed"
- Verifique `npm install` local
- Confirme versão do Node.js (16+)
- Revise logs de build no Netlify

### Erro: "404 em rotas"
- Confirme que `_redirects` está na pasta dist
- Verifique configuração SPA no netlify.toml

## 🔄 Atualizações

### Deploy de Atualizações
1. Faça as alterações localmente
2. Teste com `npm run dev`
3. Commit e push:
   ```bash
   git add .
   git commit -m "Update: descrição da mudança"
   git push origin main
   ```
4. Netlify fará deploy automático

### Rollback
1. No Netlify, vá em "Deploys"
2. Encontre um deploy anterior funcional
3. Clique em "Publish deploy"

## 📱 PWA

### Verificar PWA
1. Abra o site no Chrome
2. F12 > Application > Manifest
3. Confirme Service Worker ativo
4. Teste instalação como app

### Atualizar PWA
- Altere versão em manifest.json
- Service Worker atualizará automaticamente

## ✅ Pós-Deploy

1. **Teste todas as funcionalidades:**
   - [ ] Jogo single player
   - [ ] Criar sala multiplayer
   - [ ] Entrar em sala existente
   - [ ] Chat funcionando
   - [ ] PWA instalável

2. **Performance:**
   - [ ] Lighthouse score > 90
   - [ ] Tempo de carregamento < 3s
   - [ ] Assets otimizados

3. **Compartilhe:**
   - Link: https://mestre-das-rochas.netlify.app
   - Redes sociais
   - Comunidades de board games

## 📞 Suporte

Problemas? Abra uma issue em:
https://github.com/roneymatusp2/mestredasrochas/issues

---

🎉 **Parabéns! Seu jogo está online!**