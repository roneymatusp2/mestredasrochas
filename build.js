const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

async function build() {
  console.log(`${colors.blue}🚀 Iniciando build de produção...${colors.reset}\n`);

  try {
    // 1. Criar diretório dist
    console.log(`${colors.yellow}📁 Criando diretório dist...${colors.reset}`);
    await fs.mkdir('dist', { recursive: true });

    // 2. Copiar arquivos estáticos
    console.log(`${colors.yellow}📋 Copiando arquivos estáticos...${colors.reset}`);
    const filesToCopy = [
      'index.html',
      'mestre-das-rochas.html',
      'manifest.json',
      'sw.js',
      'favicon.ico',
      'netlify.toml',
      '.gitignore',
      'README.md',
      'LICENSE',
      'supabase-init.sql'
    ];

    for (const file of filesToCopy) {
      try {
        await fs.copyFile(file, path.join('dist', file));
        console.log(`  ✓ ${file}`);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        console.log(`  ⚠️  ${file} não encontrado`);
      }
    }

    // 3. Copiar diretórios
    console.log(`\n${colors.yellow}📂 Copiando diretórios...${colors.reset}`);
    const dirsToCopy = ['public', 'assets', 'src'];
    
    for (const dir of dirsToCopy) {
      await copyDir(dir, path.join('dist', dir));
      console.log(`  ✓ ${dir}/`);
    }

    // 4. Criar arquivo de configuração de produção
    console.log(`\n${colors.yellow}⚙️  Criando configuração de produção...${colors.reset}`);
    const prodConfig = `
// Configuração de produção
window.SUPABASE_CONFIG = {
  url: 'https://gjvtncdjcslnkfctqnfy.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdnRuY2RqY3NsbmtmY3RxbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzM0MDEsImV4cCI6MjA1OTU0OTQwMX0.AzALxUUvYLJJtDkvxt7efJ7bGxeKmzOs-fT5bQOndiU'
};
`;
    await fs.writeFile('dist/config.js', prodConfig);
    console.log(`  ✓ config.js`);

    // 5. Atualizar index.html para incluir config.js
    console.log(`\n${colors.yellow}📝 Atualizando index.html...${colors.reset}`);
    let indexContent = await fs.readFile('dist/index.html', 'utf8');
    indexContent = indexContent.replace(
      '<!-- Supabase -->',
      '<!-- Supabase -->\n    <script src="config.js"></script>'
    );
    await fs.writeFile('dist/index.html', indexContent);
    console.log(`  ✓ index.html atualizado`);

    // 6. Criar _redirects para Netlify
    console.log(`\n${colors.yellow}🔀 Criando redirects...${colors.reset}`);
    const redirects = `# Netlify redirects
/* /index.html 200
`;
    await fs.writeFile('dist/_redirects', redirects);
    console.log(`  ✓ _redirects`);

    // 7. Criar arquivo .env.example na dist
    console.log(`\n${colors.yellow}🔐 Criando .env.example...${colors.reset}`);
    const envExample = await fs.readFile('.env.example', 'utf8');
    await fs.writeFile('dist/.env.example', envExample);
    console.log(`  ✓ .env.example`);

    // 8. Gerar assets se necessário
    console.log(`\n${colors.yellow}🎨 Verificando assets...${colors.reset}`);
    try {
      await fs.access('assets/icons/icon-192x192.png');
      console.log(`  ✓ Ícones já existem`);
    } catch {
      console.log(`  ⚠️  Executando geração de ícones...`);
      execSync('node assets/generate-icons.js', { stdio: 'inherit' });
    }

    console.log(`\n${colors.green}✅ Build concluído com sucesso!${colors.reset}`);
    console.log(`\n${colors.blue}📦 Para fazer deploy:${colors.reset}`);
    console.log(`  1. git add .`);
    console.log(`  2. git commit -m "Build de produção"`);
    console.log(`  3. git push origin main`);
    console.log(`\n${colors.blue}🌐 Ou faça deploy manual no Netlify:${colors.reset}`);
    console.log(`  - Arraste a pasta 'dist' para o Netlify`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Erro durante o build:${colors.reset}`, error);
    process.exit(1);
  }
}

// Função auxiliar para copiar diretórios recursivamente
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Executar build
build();