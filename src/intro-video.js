// Sistema de Vídeo de Introdução para Mestre das Rochas - Versão Robusta com Appwrite

class IntroVideoSystem {
  constructor() {
    this.container = null;
    this.video = null;
    this.isPlaying = false;
    this.hasShown = localStorage.getItem('intro-video-shown') === 'true';
    this.videoSources = [
      // Appwrite URL como primeira opção (mais confiável)
      'https://nyc.cloud.appwrite.io/v1/storage/buckets/688033d700210f07ca87/files/688033e60016c7562df0/view?project=688033c900351e6b5fa7&mode=admin',
      // Fallbacks locais
      './public/mestredasrochas_intro.mp4',
      'public/mestredasrochas_intro.mp4',
      '/public/mestredasrochas_intro.mp4'
    ];
    this.currentSourceIndex = 0;

    console.log('IntroVideoSystem initialized with Appwrite URL');

    // Tentar obter URL do Supabase se disponível
    this.initSupabaseSource();
  }

  // Inicializar fonte do Supabase
  async initSupabaseSource() {
    try {
      if (window.supabaseVideoManager) {
        const supabaseUrl = window.supabaseVideoManager.getVideoUrl();
        if (supabaseUrl) {
          this.videoSources.unshift(supabaseUrl);
          console.log('Supabase video URL added:', supabaseUrl);
        }
      }
    } catch (error) {
      console.warn('Could not get Supabase video URL:', error);
    }
  }

  // Criar estilos CSS dinâmicos
  injectStyles() {
    if (document.getElementById('intro-video-styles')) return;

    const style = document.createElement('style');
    style.id = 'intro-video-styles';
    style.textContent = `
      .intro-video-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.8s ease, visibility 0.8s ease;
      }

      .intro-video-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .intro-video-player {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #000;
      }

      .intro-video-controls {
        position: absolute;
        bottom: 30px;
        right: 30px;
        z-index: 100001;
        display: flex;
        gap: 15px;
      }

      .intro-btn {
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.4);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        font-family: 'Inter', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .intro-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }

      .intro-btn.play-btn {
        background: rgba(0, 255, 100, 0.2);
        border-color: rgba(0, 255, 100, 0.5);
      }

      .intro-btn.play-btn:hover {
        background: rgba(0, 255, 100, 0.3);
        border-color: rgba(0, 255, 100, 0.7);
      }

      .intro-video-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 18px;
        font-family: 'Inter', sans-serif;
        text-align: center;
      }

      .intro-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255,255,255,0.3);
        border-top: 3px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .intro-video-controls {
          bottom: 20px;
          right: 20px;
          flex-direction: column;
        }
        
        .intro-btn {
          padding: 10px 16px;
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(style);
    console.log('Intro video styles injected');
  }

  // Criar HTML do overlay
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'intro-video-overlay';
    overlay.id = 'intro-video-overlay';

    overlay.innerHTML = `
      <video class="intro-video-player" id="intro-video-player" preload="metadata" muted>
        <source src="https://nyc.cloud.appwrite.io/v1/storage/buckets/688033d700210f07ca87/files/688033e60016c7562df0/view?project=688033c900351e6b5fa7&mode=admin" type="video/mp4">
        <source src="./public/mestredasrochas_intro.mp4" type="video/mp4">
        <source src="public/mestredasrochas_intro.mp4" type="video/mp4">
        Seu navegador não suporta reprodução de vídeo HTML5.
      </source>
      
      <div class="intro-video-loading" id="intro-loading">
        <div class="intro-spinner"></div>
        <div>Carregando vídeo de introdução...</div>
      </div>
      
      <div class="intro-video-controls" id="intro-controls" style="display: none;">
        <button class="intro-btn play-btn" id="intro-play-btn">
          ▶ REPRODUZIR
        </button>
        <button class="intro-btn" id="intro-skip-btn">
          ⏭ PULAR
        </button>
      </div>
    `;

    return overlay;
  }

  // Configurar eventos do vídeo
  setupVideoEvents(video) {
    video.addEventListener('loadstart', () => {
      console.log('Video loading started');
    });

    video.addEventListener('loadedmetadata', () => {
      console.log('Video metadata loaded');
      this.hideLoading();
      this.showControls();
    });

    video.addEventListener('canplay', () => {
      console.log('Video can start playing');
      this.tryAutoplay();
    });

    video.addEventListener('play', () => {
      console.log('Video started playing');
      this.isPlaying = true;
      this.hideControls();
    });

    video.addEventListener('pause', () => {
      console.log('Video paused');
      this.isPlaying = false;
      this.showControls();
    });

    video.addEventListener('ended', () => {
      console.log('Video ended');
      this.closeVideo();
    });

    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
      this.handleVideoError();
    });
  }

  // Tentar reprodução automática
  async tryAutoplay() {
    if (!this.video) return;

    try {
      await this.video.play();
      console.log('Autoplay successful');
    } catch (error) {
      console.warn('Autoplay blocked:', error);
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
      playBtn.textContent = '▶ CLIQUE PARA ASSISTIR';
    }
  }

  // Esconder loading
  hideLoading() {
    const loading = document.getElementById('intro-loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  // Mostrar controles
  showControls() {
    const controls = document.getElementById('intro-controls');
    if (controls && !this.isPlaying) {
      controls.style.display = 'flex';
    }
  }

  // Esconder controles
  hideControls() {
    const controls = document.getElementById('intro-controls');
    if (controls) {
      controls.style.display = 'none';
    }
  }

  // Configurar controles
  setupControls() {
    const playBtn = document.getElementById('intro-play-btn');
    const skipBtn = document.getElementById('intro-skip-btn');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.video) {
          this.video.play();
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.closeVideo();
      });
    }

    // Atalhos de teclado
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
  }

  // Lidar com teclado
  handleKeyboard(event) {
    if (!this.container) return;

    switch(event.code) {
      case 'Space':
      case 'Enter':
        event.preventDefault();
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
        this.closeVideo();
        break;
    }
  }

  // Lidar com erro do vídeo
  handleVideoError() {
    console.error('Erro ao carregar vídeo, pulando introdução');
    setTimeout(() => {
      this.closeVideo();
    }, 2000);
  }

  // Fechar vídeo
  closeVideo() {
    if (!this.container) return;

    console.log('Closing intro video');

    // Marcar como visualizado
    localStorage.setItem('intro-video-shown', 'true');

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
      document.removeEventListener('keydown', this.handleKeyboard.bind(this));

    }, 800);
  }

  // Resetar para mostrar novamente
  reset() {
    localStorage.removeItem('intro-video-shown');
    this.hasShown = false;
    console.log('Intro video reset');
  }

  // Mostrar vídeo
  async show() {
    // Se já foi mostrado, pular
    if (this.hasShown) {
      console.log('Intro video already shown, skipping');
      return;
    }

    console.log('Showing intro video');

    // Injetar estilos
    this.injectStyles();

    // Criar overlay
    this.container = this.createOverlay();
    document.body.appendChild(this.container);

    // Obter referência do vídeo
    this.video = document.getElementById('intro-video-player');

    if (!this.video) {
      console.error('Video element not found');
      return;
    }

    // Configurar eventos
    this.setupVideoEvents(this.video);
    this.setupControls();

    // Mostrar overlay
    setTimeout(() => {
      if (this.container) {
        this.container.classList.add('show');
      }
    }, 100);

    // Iniciar carregamento
    this.video.load();
  }
}

// Criar instância global
window.introVideoSystem = new IntroVideoSystem();

// Auto-inicialização mais agressiva
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing intro video');
  setTimeout(() => {
    if (window.introVideoSystem) {
      window.introVideoSystem.show();
    }
  }, 200);
});

// Fallback para carregamento da janela
window.addEventListener('load', () => {
  console.log('Window loaded, checking intro video');
  if (window.introVideoSystem && !window.introVideoSystem.container) {
    setTimeout(() => {
      window.introVideoSystem.show();
    }, 100);
  }
});

// Compatibilidade com código existente
window.introVideo = {
  show: () => window.introVideoSystem.show(),
  reset: () => window.introVideoSystem.reset(),
  skip: () => window.introVideoSystem.closeVideo()
};

console.log('Intro Video System loaded successfully');
// Remover export para compatibilidade
