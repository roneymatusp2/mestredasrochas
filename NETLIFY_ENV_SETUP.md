# Configuração de Variáveis de Ambiente no Netlify

## 🔐 Variáveis Necessárias

Após fazer o deploy, configure estas variáveis no painel do Netlify:

1. Acesse seu site no Netlify
2. Vá em **Site settings** > **Environment variables**
3. Adicione as seguintes variáveis:

```
SUPABASE_URL = https://gjvtncdjcslnkfctqnfy.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdnRuY2RqY3NsbmtmY3RxbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzM0MDEsImV4cCI6MjA1OTU0OTQwMX0.AzALxUUvYLJJtDkvxt7efJ7bGxeKmzOs-fT5bQOndiU
```

## 📝 Alternativa: Usar Netlify CLI

```bash
# Configure as variáveis via CLI
netlify env:set SUPABASE_URL "https://gjvtncdjcslnkfctqnfy.supabase.co"
netlify env:set SUPABASE_ANON_KEY "sua_chave_aqui"
```

## 🚀 Deploy Seguro

1. Use os arquivos `-safe.js` em produção
2. Nunca commite arquivos com chaves expostas
3. Mantenha `.env` no `.gitignore`

## ✅ Verificação

Após configurar, faça um redeploy para aplicar as variáveis:

```bash
netlify deploy --prod
```