import React, { useState, useEffect } from 'react';
import soundManager from '../services/soundManager';

const AudioControls = () => {
  const [settings, setSettings] = useState({
    musicEnabled: true,
    soundEnabled: true
  });

  // Load settings from sound manager on component mount
  useEffect(() => {
    const managerSettings = soundManager.getSettings();
    setSettings({
      musicEnabled: managerSettings.musicEnabled,
      soundEnabled: managerSettings.soundEnabled
    });
  }, []);

  // Listen for settings changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedSettings = localStorage.getItem('gameSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          musicEnabled: parsedSettings.musicEnabled,
          soundEnabled: parsedSettings.soundEnabled
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleMusic = () => {
    const newMusicState = !settings.musicEnabled;
    const newSettings = {
      ...soundManager.getSettings(),
      musicEnabled: newMusicState
    };
    
    // Update sound manager and localStorage
    soundManager.updateSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
    
    // Update local state
    setSettings(prev => ({
      ...prev,
      musicEnabled: newMusicState
    }));

    // Play click sound if sounds are enabled
    if (settings.soundEnabled) {
      soundManager.playClickSound();
    }
  };

  const toggleSound = () => {
    const newSoundState = !settings.soundEnabled;
    const newSettings = {
      ...soundManager.getSettings(),
      soundEnabled: newSoundState
    };
    
    // Play click sound before updating (if currently enabled)
    if (settings.soundEnabled) {
      soundManager.playClickSound();
    }
    
    // Update sound manager and localStorage
    soundManager.updateSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
    
    // Update local state
    setSettings(prev => ({
      ...prev,
      soundEnabled: newSoundState
    }));
  };

  return (
    <div className="fixed top-4 left-4 z-40 flex flex-col gap-2">
      {/* Music Toggle */}
      <button
        onClick={toggleMusic}
        className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 ${
          settings.musicEnabled 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
        }`}
        title={settings.musicEnabled ? 'Music: ON (Click to disable)' : 'Music: OFF (Click to enable)'}
      >
        <div className="text-lg">
          {settings.musicEnabled ? '🎵' : '🔇'}
        </div>
      </button>

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 ${
          settings.soundEnabled 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
        }`}
        title={settings.soundEnabled ? 'Sounds: ON (Click to disable)' : 'Sounds: OFF (Click to enable)'}
      >
        <div className="text-lg">
          {settings.soundEnabled ? '🔊' : '🔇'}
        </div>
      </button>
    </div>
  );
};

export default AudioControls;
