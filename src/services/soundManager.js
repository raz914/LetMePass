class SoundManager {
  constructor() {
    this.backgroundMusic = null;
    this.clickSound = null;
    this.popSound = null;
    this.settings = {
      musicEnabled: true,
      soundEnabled: true,
      responseSoundEnabled: true
    };
    this.loadSettings();
    this.initializeAudio();
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  initializeAudio() {
    // Initialize background music
    this.backgroundMusic = new Audio('/music/gameMusic.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3;

    // Initialize sound effects
    this.clickSound = new Audio('/sounds/click.mp3');
    this.clickSound.volume = 0.5;

    this.popSound = new Audio('/sounds/pop.mp3');
    this.popSound.volume = 0.4;

    // Preload audio files
    this.preloadAudio();
  }

  preloadAudio() {
    // Preload all audio files to prevent delays
    const audioFiles = [
      '/music/gameMusic.mp3',
      '/sounds/click.mp3',
      '/sounds/pop.mp3'
    ];

    audioFiles.forEach(file => {
      const audio = new Audio(file);
      audio.load();
    });
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update background music state
    if (this.backgroundMusic) {
      if (this.settings.musicEnabled && this.backgroundMusic.paused) {
        this.backgroundMusic.play().catch(e => console.log('Music play failed:', e));
      } else if (!this.settings.musicEnabled && !this.backgroundMusic.paused) {
        this.backgroundMusic.pause();
      }
    }
  }

  playBackgroundMusic() {
    if (this.settings.musicEnabled && this.backgroundMusic) {
      this.backgroundMusic.play().catch(e => console.log('Music play failed:', e));
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  resumeBackgroundMusic() {
    if (this.settings.musicEnabled && this.backgroundMusic) {
      this.backgroundMusic.play().catch(e => console.log('Music resume failed:', e));
    }
  }

  playClickSound() {
    if (this.settings.soundEnabled && this.clickSound) {
      // Reset to beginning and play
      this.clickSound.currentTime = 0;
      this.clickSound.play().catch(e => console.log('Click sound failed:', e));
    }
  }

  playPopSound() {
    if (this.settings.responseSoundEnabled && this.popSound) {
      // Reset to beginning and play
      this.popSound.currentTime = 0;
      this.popSound.play().catch(e => console.log('Pop sound failed:', e));
    }
  }

  // Method to get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Method to set volume levels
  setMusicVolume(volume) {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setSoundVolume(volume) {
    const vol = Math.max(0, Math.min(1, volume));
    if (this.clickSound) {
      this.clickSound.volume = vol;
    }
    if (this.popSound) {
      this.popSound.volume = vol;
    }
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

export default soundManager;
