// Sistema de Vídeo de Introdução para Mestre das Rochas

export class IntroVideo {
  constructor() {
    this.container = null;
    this.video = null;
    this.hasPlayed = localStorage.getItem('intro-played') === 'true';
  }

  // Criar HTML do vídeo
  createHTML() {
    return `
      <div id="intro-video-container" class="intro-video-container">
        <video id="intro-video" class="intro-video" autoplay>
          <source src="public/mestredasrochas_intro.mp4" type="video/mp4">
          Seu navegador não suporta vídeos HTML5.
        </video>
        <div class="intro-controls">
          <button class="skip-intro-btn" onclick="introVideo.skip()">
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
      // Criar container
      const div = document.createElement('div');
      div.innerHTML = this.createHTML();
      document.body.appendChild(div);
      
      this.container = document.getElementById('intro-video-container');
      this.video = document.getElementById('intro-video');
      
      // Adicionar estilos
      this.createStyles();
      
      // Configurar eventos
      this.video.addEventListener('ended', () => {
        this.hide();
        resolve();
      });

      this.video.addEventListener('error', (e) => {
        console.error('Erro ao carregar vídeo de introdução:', e);
        this.hide();
        resolve();
      });

      // Mostrar com fade
      setTimeout(() => {
        this.container.classList.add('active');
      }, 100);

      // Marcar como já exibido
      localStorage.setItem('intro-played', 'true');
      this.hasPlayed = true;
    });
  }

  // Pular introdução
  skip() {
    if (this.video) {
      this.video.pause();
      this.hide();
    }
  }

  // Esconder vídeo
  hide() {
    if (this.container) {
      this.container.classList.remove('active');
      setTimeout(() => {
        this.container.remove();
        this.container = null;
        this.video = null;
      }, 500);
    }
  }

  // Verificar se deve mostrar novamente
  shouldShowAgain() {
    // Pode adicionar lógica para mostrar em ocasiões especiais
    // Por exemplo, após atualizações importantes
    const lastShown = localStorage.getItem('intro-last-shown');
    const daysSinceLastShown = lastShown ? 
      (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24) : Infinity;
    
    // Mostrar novamente após 30 dias
    return daysSinceLastShown > 30;
  }

  // Resetar preferência
  reset() {
    localStorage.removeItem('intro-played');
    localStorage.removeItem('intro-last-shown');
    this.hasPlayed = false;
  }
}

// Criar instância global
window.introVideo = new IntroVideo();

// Exportar para uso modular
export default IntroVideo;