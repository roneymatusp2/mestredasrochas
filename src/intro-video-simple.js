// Sistema Simplificado de Vídeo de Introdução com Appwrite
(function() {
  'use strict';

  const APPWRITE_VIDEO_URL = 'https://nyc.cloud.appwrite.io/v1/storage/buckets/688033d700210f07ca87/files/688033e60016c7562df0/view?project=688033c900351e6b5fa7&mode=admin';

  class IntroVideoSimple {
    constructor() {
      this.container = null;
      this.video = null;
      this.hasShown = localStorage.getItem('intro-shown') === 'true';
    }

    createContainer() {
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="intro-overlay" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.5s ease;
        ">
          <video id="intro-video" style="
            width: 100%;
            height: 100%;
            object-fit: contain;
          " muted>
            <source src="${APPWRITE_VIDEO_URL}" type="video/mp4">
          </video>
          
          <div id="intro-controls" style="
            position: absolute;
            bottom: 30px;
            right: 30px;
            display: flex;
            gap: 15px;
            z-index: 100000;
          ">
            <button id="play-btn" style="
              background: rgba(0, 255, 100, 0.3);
              border: 2px solid rgba(0, 255, 100, 0.6);
              color: white;
              padding: 15px 25px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              display: none;
            ">▶ ASSISTIR</button>
            
            <button id="skip-btn" style="
              background: rgba(255, 255, 255, 0.2);
              border: 2px solid rgba(255, 255, 255, 0.5);
              color: white;
              padding: 15px 25px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
            ">PULAR INTRODUÇÃO</button>
          </div>
        </div>
      `;
      
      return container.firstElementChild;
    }

    async show() {
      if (this.hasShown) return;

      this.container = this.createContainer();
      document.body.appendChild(this.container);
      
      this.video = document.getElementById('intro-video');
      const overlay = document.getElementById('intro-overlay');
      const playBtn = document.getElementById('play-btn');
      const skipBtn = document.getElementById('skip-btn');

      // Fade in
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 100);

      // Configurar eventos
      this.video.addEventListener('ended', () => this.close());
      
      this.video.addEventListener('error', (e) => {
        console.error('Erro ao carregar vídeo:', e);
        this.close();
      });

      skipBtn.addEventListener('click', () => this.close());
      
      playBtn.addEventListener('click', () => {
        this.video.play();
        playBtn.style.display = 'none';
      });

      // Tentar autoplay
      try {
        await this.video.play();
      } catch (e) {
        // Se autoplay falhar, mostrar botão play
        playBtn.style.display = 'block';
      }
    }

    close() {
      if (!this.container) return;
      
      localStorage.setItem('intro-shown', 'true');
      
      const overlay = document.getElementById('intro-overlay');
      overlay.style.opacity = '0';
      
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
      }, 500);
    }

    reset() {
      localStorage.removeItem('intro-shown');
      this.hasShown = false;
    }
  }

  // Criar instância global
  window.introVideo = new IntroVideoSimple();

  // Auto-iniciar quando DOM carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => window.introVideo.show(), 500);
    });
  } else {
    setTimeout(() => window.introVideo.show(), 500);
  }

})();