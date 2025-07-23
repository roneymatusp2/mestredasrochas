// Sistema de Vídeo de Introdução para Mestre das Rochas - Versão Final com Appwrite

class IntroVideoSystem {
  constructor() {
    this.container = null;
    this.video = null;
    this.isPlaying = false;
    this.hasShown = localStorage.getItem('intro-video-shown') === 'true';

    console.log('🎬 IntroVideoSystem initialized with Appwrite URL');
    console.log('📹 hasShown status:', this.hasShown);
  }

  // Criar estilos CSS dinâmicos
  injectStyles() {
    if (document.getElementById('intro-video-styles')) return;

    const style = document.createElement('style');
    style.id = 'intro-video-styles';
    style.textContent = `
      .intro-video-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: #000 !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s ease, visibility 0.5s ease;
      }

      .intro-video-overlay.show {
        opacity: 1 !important;
        visibility: visible !important;
      }

      .intro-video-player {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        background: #000 !important;
      }

      .intro-video-controls {
        position: absolute !important;
        bottom: 30px !important;
        right: 30px !important;
        z-index: 1000000 !important;
        display: flex !important;
        gap: 15px !important;
      }

      .intro-btn {
        background: rgba(255, 255, 255, 0.2) !important;
        border: 2px solid rgba(255, 255, 255, 0.5) !important;
        color: white !important;
        padding: 15px 25px !important;
        border-radius: 8px !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        backdrop-filter: blur(10px) !important;
        font-family: 'Inter', sans-serif !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }

      .intro-btn:hover {
        background: rgba(255, 255, 255, 0.3) !important;
        border-color: rgba(255, 255, 255, 0.7) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
      }

      .intro-btn.play-btn {
        background: rgba(0, 255, 100, 0.3) !important;
        border-color: rgba(0, 255, 100, 0.6) !important;
      }

      .intro-btn.play-btn:hover {
        background: rgba(0, 255, 100, 0.4) !important;
        border-color: rgba(0, 255, 100, 0.8) !important;
      }

      .intro-video-loading {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        color: white !important;
        font-size: 20px !important;
        font-family: 'Inter', sans-serif !important;
        text-align: center !important;
      }

      .intro-spinner {
        width: 50px !important;
        height: 50px !important;
        border: 4px solid rgba(255,255,255,0.3) !important;
        border-top: 4px solid white !important;
        border-radius: 50% !important;
        animation: spin 1s linear infinite !important;
        margin: 0 auto 20px !important;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .intro-video-controls {
          bottom: 20px !important;
          right: 20px !important;
          flex-direction: column !important;
        }
        
        .intro-btn {
          padding: 12px 20px !important;
          font-size: 14px !important;
        }
      }
    `;
    document.head.appendChild(style);
    console.log('🎨 Intro video styles injected');
  }

  // Criar HTML do overlay
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'intro-video-overlay';
    overlay.id = 'intro-video-overlay';

    overlay.innerHTML = `
      <video class="intro-video-player" id="intro-video-player" preload="auto" muted crossorigin="anonymous">
        <source src="https://nyc.cloud.appwrite.io/v1/storage/buckets/688033d700210f07ca87/files/688033e60016c7562df0/view?project=688033c900351e6b5fa7&mode=admin" type="video/mp4">
        Seu navegador não suporta reprodução de vídeo HTML5.
      </video>
      
      <div class="intro-video-loading" id="intro-loading">
        <div class="intro-spinner"></div>
        <div>Carregando vídeo de introdução...</div>
      </div>
      
      <div class="intro-video-controls" id="intro-controls" style="display: none;">
        <button class="intro-btn play-btn" id="intro-play-btn">
          ▶ CLIQUE PARA ASSISTIR
        </button>
        <button class="intro-btn" id="intro-skip-btn">
          ⏭ PULAR INTRODUÇÃO
        </button>
      </div>
    `;

    return overlay;
  }

  // Configurar eventos do vídeo
  setupVideoEvents(video) {
    video.addEventListener('loadstart', () => {
      console.log('📺 Video loading started');
    });

    video.addEventListener('loadedmetadata', () => {
      console.log('✅ Video metadata loaded');
      this.hideLoading();
      this.showControls();
    });

    video.addEventListener('canplay', () => {
      console.log('🎯 Video can start playing');
      this.tryAutoplay();
    });

    video.addEventListener('play', () => {
      console.log('▶️ Video started playing');
      this.isPlaying = true;
      this.hideControls();
    });

    video.addEventListener('pause', () => {
      console.log('⏸️ Video paused');
      this.isPlaying = false;
      this.showControls();
    });

    video.addEventListener('ended', () => {
      console.log('🏁 Video ended');
      this.closeVideo();
    });

    video.addEventListener('error', (e) => {
      console.error('❌ Video error:', e);
      console.error('❌ Video error details:', {
        code: e.target.error?.code,
        message: e.target.error?.message,
        networkState: e.target.networkState,
        readyState: e.target.readyState
      });
      this.handleVideoError();
    });

    video.addEventListener('stalled', () => {
      console.warn('⚠️ Video stalled');
    });

    video.addEventListener('waiting', () => {
      console.log('⏳ Video waiting for data');
    });
  }

  // Tentar reprodução automática
  async tryAutoplay() {
    if (!this.video) return;

    try {
      console.log('🚀 Attempting autoplay...');
      await this.video.play();
      console.log('✅ Autoplay successful');
    } catch (error) {
      console.warn('🚫 Autoplay blocked:', error);
      this.showPlayButton();
    }
  }

  // Mostrar botão de play
  showPlayButton() {
    const playBtn = document.getElementById('intro-play-btn');
    const controls = document.getElementById('intro-controls');

    if (playBtn && controls) {
      controls.style.display = 'flex';
      playBtn.style.display = 'block';
      console.log('🎮 Play button shown');
    }
  }

  // Esconder loading
  hideLoading() {
    const loading = document.getElementById('intro-loading');
    if (loading) {
      loading.style.display = 'none';
      console.log('⏳ Loading hidden');
    }
  }

  // Mostrar controles
  showControls() {
    const controls = document.getElementById('intro-controls');
    if (controls && !this.isPlaying) {
      controls.style.display = 'flex';
      console.log('🎮 Controls shown');
    }
  }

  // Esconder controles
  hideControls() {
    const controls = document.getElementById('intro-controls');
    if (controls) {
      controls.style.display = 'none';
      console.log('🎮 Controls hidden');
    }
  }

  // Configurar controles
  setupControls() {
    const playBtn = document.getElementById('intro-play-btn');
    const skipBtn = document.getElementById('intro-skip-btn');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        console.log('🎬 Play button clicked');
        if (this.video) {
          this.video.play();
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        console.log('⏭️ Skip button clicked');
        this.closeVideo();
      });
    }

    // Atalhos de teclado
    const keyboardHandler = this.handleKeyboard.bind(this);
    document.addEventListener('keydown', keyboardHandler);

    // Salvar referência para poder remover depois
    this.keyboardHandler = keyboardHandler;
  }

  // Lidar com teclado
  handleKeyboard(event) {
    if (!this.container) return;

    switch(event.code) {
      case 'Space':
      case 'Enter':
        event.preventDefault();
        console.log('⌨️ Keyboard play/pause');
        if (this.video) {
          if (this.video.paused) {
            this.video.play();
          } else {
            this.video.pause();
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        console.log('⌨️ Keyboard escape');
        this.closeVideo();
        break;
    }
  }

  // Lidar com erro do vídeo
  handleVideoError() {
    console.error('❌ Erro ao carregar vídeo, pulando introdução em 3 segundos...');
    setTimeout(() => {
      this.closeVideo();
    }, 3000);
  }

  // Fechar vídeo
  closeVideo() {
    if (!this.container) return;

    console.log('🚪 Closing intro video');

    // Marcar como visualizado
    localStorage.setItem('intro-video-shown', 'true');

    // Pausar vídeo
    if (this.video) {
      this.video.pause();
    }

    // Fade out
    this.container.classList.remove('show');

    // Remover após animação
    setTimeout(() => {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
        this.container = null;
        this.video = null;
      }

      // Remover listeners
      if (this.keyboardHandler) {
        document.removeEventListener('keydown', this.keyboardHandler);
      }

      console.log('✅ Intro video closed and cleaned up');
    }, 500);
  }

  // Resetar para mostrar novamente
  reset() {
    localStorage.removeItem('intro-video-shown');
    this.hasShown = false;
    console.log('🔄 Intro video reset - will show on next visit');
  }

  // Mostrar vídeo
  async show() {
    console.log('🎬 Attempting to show intro video...');

    // Se já foi mostrado, pular (comentar linha abaixo para sempre mostrar)
    if (this.hasShown) {
      console.log('⏭️ Intro video already shown, skipping');
      return;
    }

    console.log('🚀 Showing intro video overlay');

    // Injetar estilos
    this.injectStyles();

    // Criar overlay
    this.container = this.createOverlay();
    document.body.appendChild(this.container);

    // Obter referência do vídeo
    this.video = document.getElementById('intro-video-player');

    if (!this.video) {
      console.error('❌ Video element not found');
      return;
    }

    // Configurar eventos
    this.setupVideoEvents(this.video);
    this.setupControls();

    // Mostrar overlay imediatamente
    setTimeout(() => {
      if (this.container) {
        this.container.classList.add('show');
        console.log('✨ Overlay shown with fade-in effect');
      }
    }, 100);

    // Iniciar carregamento
    console.log('📥 Starting video load...');
    this.video.load();
  }
}

// Criar instância global
console.log('🎯 Creating IntroVideoSystem instance...');
window.introVideoSystem = new IntroVideoSystem();

// Forçar reset para teste (comentar em produção)
localStorage.removeItem('intro-video-shown');

// Auto-inicialização IMEDIATA
console.log('⚡ Setting up immediate initialization...');

// Função de inicialização
function initIntroVideo() {
  console.log('🎬 Initializing intro video...');
  if (window.introVideoSystem) {
    window.introVideoSystem.show();
  } else {
    console.error('❌ IntroVideoSystem not found!');
  }
}

// Múltiplos pontos de entrada para garantir execução
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntroVideo);
} else {
  // DOM já carregou
  setTimeout(initIntroVideo, 100);
}

// Fallback adicional
window.addEventListener('load', () => {
  console.log('🌐 Window loaded, checking intro video...');
  if (window.introVideoSystem && !window.introVideoSystem.container) {
    setTimeout(initIntroVideo, 100);
  }
});

// Compatibilidade com código existente
window.introVideo = {
  show: () => {
    console.log('🎬 Manual show triggered');
    return window.introVideoSystem.show();
  },
  reset: () => {
    console.log('🔄 Manual reset triggered');
    return window.introVideoSystem.reset();
  },
  skip: () => {
    console.log('⏭️ Manual skip triggered');
    return window.introVideoSystem.closeVideo();
  }
};

console.log('✅ Intro Video System loaded successfully with Appwrite URL');
