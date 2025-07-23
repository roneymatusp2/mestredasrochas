const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuração de tamanhos de ícones PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar ícone base programaticamente
async function generateBaseIcon() {
  const size = 512;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2c3e50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3498db;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="gem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e74c3c;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f39c12;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9b59b6;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
      
      <!-- Hexágono central -->
      <polygon points="256,80 384,160 384,320 256,400 128,320 128,160" 
               fill="url(#gem)" stroke="#ecf0f1" stroke-width="8"/>
      
      <!-- Cristais internos -->
      <polygon points="256,150 320,200 320,280 256,330 192,280 192,200" 
               fill="#ecf0f1" opacity="0.3"/>
      <polygon points="256,180 290,210 290,270 256,300 222,270 222,210" 
               fill="#ecf0f1" opacity="0.5"/>
      
      <!-- Texto -->
      <text x="256" y="460" font-family="Arial, sans-serif" font-size="48" 
            font-weight="bold" text-anchor="middle" fill="#ecf0f1">
        MESTRE
      </text>
    </svg>
  `;
  
  return svg;
}

// Gerar todos os tamanhos de ícones
async function generateIcons() {
  const baseSvg = await generateBaseIcon();
  
  // Gerar ícones em diferentes tamanhos
  for (const size of iconSizes) {
    await sharp(Buffer.from(baseSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, 'icons', `icon-${size}x${size}.png`));
    
    console.log(`✓ Gerado icon-${size}x${size}.png`);
  }
  
  // Gerar favicon
  await sharp(Buffer.from(baseSvg))
    .resize(32, 32)
    .toFile(path.join(__dirname, '..', 'favicon.ico'));
  
  console.log('✓ Gerado favicon.ico');
  
  // Gerar apple-touch-icon
  await sharp(Buffer.from(baseSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'icons', 'apple-touch-icon.png'));
  
  console.log('✓ Gerado apple-touch-icon.png');
}

// Gerar screenshots de exemplo
async function generateScreenshots() {
  const screenshotSvg = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect width="1280" height="720" fill="#1a1a2e"/>
      
      <!-- Simulação de tabuleiro -->
      <g transform="translate(400, 200)">
        ${Array.from({length: 7}, (_, i) => 
          Array.from({length: 7}, (_, j) => `
            <polygon points="${100+j*60},${50+i*50} ${140+j*60},${50+i*50} 
                           ${160+j*60},${80+i*50} ${140+j*60},${110+i*50} 
                           ${100+j*60},${110+i*50} ${80+j*60},${80+i*50}"
                     fill="#16213e" stroke="#0f3460" stroke-width="2"/>
          `).join('')
        ).join('')}
      </g>
      
      <!-- UI lateral -->
      <rect x="50" y="50" width="300" height="620" fill="#0f3460" rx="10" opacity="0.8"/>
      <text x="200" y="100" font-family="Arial" font-size="24" text-anchor="middle" fill="#e94560">
        Mestre das Rochas
      </text>
      
      <!-- Indicadores -->
      <rect x="80" y="150" width="240" height="60" fill="#16213e" rx="5"/>
      <text x="200" y="190" font-family="Arial" font-size="18" text-anchor="middle" fill="#f3f3f3">
        Energia: 10/15
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(screenshotSvg))
    .png()
    .toFile(path.join(__dirname, 'screenshots', 'screenshot-1.png'));
  
  console.log('✓ Gerado screenshot-1.png');
}

// Executar geração
async function main() {
  try {
    await generateIcons();
    await generateScreenshots();
    console.log('\n✅ Todos os assets foram gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar assets:', error);
  }
}

// Verificar se sharp está instalado
try {
  require.resolve('sharp');
  main();
} catch(e) {
  console.log('📦 Instalando dependência sharp...');
  const { execSync } = require('child_process');
  execSync('npm install sharp', { stdio: 'inherit' });
  console.log('✓ Sharp instalado. Execute o script novamente.');
}