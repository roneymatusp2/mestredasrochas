// Sistema de Vídeo de Introdução para Mestre das Rochas

class IntroVideo {
  constructor() {
    this.container = null;
    this.video = null;
    this.hasPlayed = localStorage.getItem('intro-played') === 'true';
  }

  // Criar HTML do vídeo
  createHTML() {
    return `
      <div id="intro-video-container" class="intro-video-container">
        <video id="intro-video" class="intro-video" autoplay muted preload="auto">
          <source src="./public/mestredasrochas_intro.mp4" type="video/mp4">
          Seu navegador não suporta vídeos HTML5.
        </video>
        <div class="intro-controls">
          <button class="skip-intro-btn" onclick="window.introVideo.skip()">
            Pular Introdução
          </button>
        </div>
      </div>
    `;
  }

  // Criar estilos CSS
  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .intro-video-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      .intro-video-container.active {
        opacity: 1;
      }

      .intro-video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .intro-controls {
        position: absolute;
        bottom: 50px;
        right: 50px;
        z-index: 10;
      }

      .skip-intro-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        backdrop-filter: blur(10px);
        font-family: 'Inter', sans-serif;
      }

      .skip-intro-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .intro-controls {
          bottom: 20px;
          right: 20px;
        }

        .skip-intro-btn {
          padding: 10px 20px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Mostrar vídeo
  async show() {
    // Se já foi exibido e usuário não quer ver novamente
    if (this.hasPlayed && !this.shouldShowAgain()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      // Criar estilos
      this.createStyles();

      // Criar container
      this.container = document.createElement('div');
      this.container.innerHTML = this.createHTML();
      document.body.appendChild(this.container);

      // Obter referências
      const videoContainer = document.getElementById('intro-video-container');
      this.video = document.getElementById('intro-video');

      // Configurar eventos do vídeo
      this.video.addEventListener('loadeddata', () => {
        videoContainer.classList.add('active');
      });

      this.video.addEventListener('ended', () => {
        this.finish(resolve);
      });

      this.video.addEventListener('error', (e) => {
        console.error('Erro ao carregar vídeo:', e);
        this.finish(resolve);
      });

      // Tentar reproduzir o vídeo
      this.video.play().catch((error) => {
        console.warn('Autoplay bloqueado, aguardando interação do usuário:', error);
        this.showPlayButton(resolve);
      });

      // Escutar tecla ESC para pular
      document.addEventListener('keydown', this.handleKeyPress.bind(this));
    });
  }

  // Mostrar botão de play quando autoplay é bloqueado
  showPlayButton(resolve) {
    const playButton = document.createElement('button');
    playButton.className = 'intro-play-btn';
    playButton.innerHTML = '<i class="fas fa-play"></i> Iniciar Vídeo';
    playButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      padding: 20px 40px;
      border-radius: 50px;
      font-size: 18px;
      cursor: pointer;
      z-index: 11;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
    `;

    playButton.onclick = () => {
      this.video.play();
      playButton.remove();
    };

    this.container.appendChild(playButton);
  }

  // Verificar se deve mostrar novamente
  shouldShowAgain() {
    return false; // Por padrão, só mostra uma vez
  }

  // Lidar com teclas pressionadas
  handleKeyPress(event) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.skip();
    }
  }

  // Pular introdução
  skip() {
    if (this.video) {
      this.video.pause();
    }
    this.finish();
  }

  // Finalizar vídeo
  finish(resolve) {
    if (this.container) {
      this.container.style.opacity = '0';
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
      }, 500);
    }

    // Marcar como reproduzido
    localStorage.setItem('intro-played', 'true');

    // Remover listener de teclas
    document.removeEventListener('keydown', this.handleKeyPress);

    if (resolve) resolve();
  }

  // Resetar para mostrar novamente
  reset() {
    localStorage.removeItem('intro-played');
    this.hasPlayed = false;
  }
}

// Criar instância global
window.introVideo = new IntroVideo();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Aguardar um breve momento para garantir que tudo carregou
  setTimeout(() => {
    window.introVideo.show();
  }, 500);
});

export default IntroVideo;