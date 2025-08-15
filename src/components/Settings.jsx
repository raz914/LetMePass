import React, { useState, useEffect } from 'react';
import soundManager from '../services/soundManager';

const Settings = ({ isVisible, onClose }) => {
  const [settings, setSettings] = useState({
    musicEnabled: true,
    soundEnabled: true,
    responseSoundEnabled: true
  });

  // Load settings from localStorage and sound manager on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      soundManager.updateSettings(parsedSettings);
    } else {
      // Use sound manager's default settings
      const managerSettings = soundManager.getSettings();
      setSettings(managerSettings);
    }
  }, []);

  // Save settings to localStorage and update sound manager whenever they change
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    soundManager.updateSettings(settings);
  }, [settings]);

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const playClickSound = () => {
    soundManager.playClickSound();
  };

  const handleButtonClick = (callback) => {
    playClickSound();
    callback();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl max-w-md w-full max-h-[90vh] text-center shadow-2xl border-2 border-purple-300 flex flex-col">
        {/* Settings Header */}
        <div className="p-6 pb-4 border-b border-purple-200">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
            Settings
          </h2>
          <div className="text-lg text-gray-700">
            🎵 Customize your audio experience
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="space-y-6">
            {/* Music Setting */}
            <div className="bg-purple-100 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-purple-800 mb-1">
                    🎵 Background Music
                  </h3>
                  <p className="text-sm text-purple-600">
                    Game music from the mystical bridge
                  </p>
                </div>
                <button
                  onClick={() => handleButtonClick(() => handleToggle('musicEnabled'))}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 ${
                    settings.musicEnabled ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.musicEnabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Sound Effects Setting */}
            <div className="bg-indigo-100 border-2 border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-1">
                    🔊 UI Sounds
                  </h3>
                  <p className="text-sm text-indigo-600">
                    Click sounds when selecting options
                  </p>
                </div>
                <button
                  onClick={() => handleButtonClick(() => handleToggle('soundEnabled'))}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 ${
                    settings.soundEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.soundEnabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Response Sound Setting */}
            <div className="bg-blue-100 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">
                    🐺 Wolfy Responses
                  </h3>
                  <p className="text-sm text-blue-600">
                    Sound when Wolfy responds to you
                  </p>
                </div>
                <button
                  onClick={() => handleButtonClick(() => handleToggle('responseSoundEnabled'))}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 ${
                    settings.responseSoundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                      settings.responseSoundEnabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                💡 Your settings are automatically saved and will be remembered for your next visit!
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="p-6 pt-4 border-t border-purple-200">
          <button
            onClick={() => handleButtonClick(onClose)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
          >
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
