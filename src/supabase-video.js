// Sistema de Upload e Carregamento de Vídeo via Supabase Storage
// Para o projeto Mestre das Rochas

class SupabaseVideoManager {
  constructor() {
    this.supabaseUrl = 'https://gjvtncdjcslnkfctqnfy.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdnRuY2RqY3NsbmtmY3RxbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNTczMTksImV4cCI6MjA1MjkzMzMxOX0.4lzNZmMWGxDiPfqiHfOxG9jKvw2GYoL5D6C5YPx6fKc'; // Substitua pela sua chave anon
    this.supabase = null;
    this.bucketName = 'game-assets';
    this.videoFileName = 'mestredasrochas_intro.mp4';

    this.initSupabase();
  }

  // Inicializar cliente Supabase
  initSupabase() {
    if (window.supabase && this.supabaseUrl && this.supabaseKey) {
      this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
      console.log('Supabase client initialized for video management');
    } else {
      console.warn('Supabase not available or missing configuration');
    }
  }

  // Fazer upload do vídeo para o Supabase Storage
  async uploadVideo(file) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    try {
      console.log('Uploading video to Supabase Storage...');

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(`videos/${this.videoFileName}`, file, {
          cacheControl: '3600',
          upsert: true // Substitui se já existir
        });

      if (error) {
        console.error('Error uploading video:', error);
        throw error;
      }

      console.log('Video uploaded successfully:', data);
      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // Obter URL pública do vídeo
  getVideoUrl() {
    if (!this.supabase) {
      return null;
    }

    try {
      const { data } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(`videos/${this.videoFileName}`);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting video URL:', error);
      return null;
    }
  }

  // Verificar se o vídeo existe no storage
  async checkVideoExists() {
    if (!this.supabase) {
      return false;
    }

    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list('videos/', {
          limit: 100,
          search: this.videoFileName
        });

      if (error) {
        console.error('Error checking video existence:', error);
        return false;
      }

      return data.some(file => file.name === this.videoFileName);
    } catch (error) {
      console.error('Error checking video:', error);
      return false;
    }
  }

  // Criar bucket se não existir
  async createBucketIfNotExists() {
    if (!this.supabase) {
      return false;
    }

    try {
      const { data, error } = await this.supabase.storage.createBucket(this.bucketName, {
        public: true,
        fileSizeLimit: 100 * 1024 * 1024, // 100MB
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg']
      });

      if (error && error.message !== 'Bucket already exists') {
        console.error('Error creating bucket:', error);
        return false;
      }

      console.log('Bucket ready:', this.bucketName);
      return true;
    } catch (error) {
      console.error('Bucket creation failed:', error);
      return false;
    }
  }

  // Upload automático do arquivo local para Supabase
  async uploadLocalVideo() {
    try {
      // Buscar o arquivo local
      const response = await fetch('./public/mestredasrochas_intro.mp4');
      if (!response.ok) {
        throw new Error('Local video file not found');
      }

      const blob = await response.blob();
      const file = new File([blob], this.videoFileName, { type: 'video/mp4' });

      // Criar bucket se necessário
      await this.createBucketIfNotExists();

      // Fazer upload
      const result = await this.uploadVideo(file);
      console.log('Local video uploaded to Supabase:', result);

      return this.getVideoUrl();
    } catch (error) {
      console.error('Failed to upload local video:', error);
      return null;
    }
  }
}

// Criar instância global
window.supabaseVideoManager = new SupabaseVideoManager();

// Função para fazer upload manual (para teste)
window.uploadVideoToSupabase = async () => {
  const manager = window.supabaseVideoManager;

  try {
    const url = await manager.uploadLocalVideo();
    if (url) {
      console.log('✅ Vídeo disponível no Supabase:', url);
      // Atualizar sistema de vídeo para usar URL do Supabase
      if (window.introVideoSystem) {
        window.introVideoSystem.videoSources.unshift(url);
      }
    }
  } catch (error) {
    console.error('❌ Erro no upload:', error);
  }
};

export default SupabaseVideoManager;
