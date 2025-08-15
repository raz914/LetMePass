import React from 'react';
import soundManager from '../services/soundManager';

const DebugPanel = ({ 
  npcService,
  debugService,
  isLoading, 
  setIsLoading, 
  setMessages, 
  showDebug, 
  setShowDebug,
  gameState 
}) => {
  const testConnection = async () => {
    setIsLoading(true);
    try {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: '🔍 Testing API connection...',
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);

      const results = await debugService.testConnection();
      
      let resultText = 'API Connection Test Results:\n';
      Object.entries(results).forEach(([endpoint, result]) => {
        if (result.error) {
          resultText += `❌ ${endpoint}: ERROR - ${result.error}\n`;
        } else {
          resultText += `${result.available ? '✅' : '❌'} ${endpoint}: ${result.status} ${result.statusText}\n`;
        }
      });

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: resultText,
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: `❌ Connection test failed: ${error.message}`,
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testGameEndpoints = async () => {
    setIsLoading(true);
    try {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: '🎮 Testing game endpoints...',
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);

      const results = await debugService.debugGameEndpoints();
      
      let resultText = 'Game Endpoints Test Results:\n';
      Object.entries(results).forEach(([endpoint, result]) => {
        if (result.error) {
          resultText += `❌ ${endpoint}: ERROR - ${result.error}\n`;
        } else {
          resultText += `${result.status === 200 ? '✅' : '❌'} ${endpoint}: ${result.status} - ${result.response || result.statusText}\n`;
        }
      });

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: resultText,
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: `❌ Game endpoint test failed: ${error.message}`,
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSwaggerDocs = async () => {
    setIsLoading(true);
    try {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: '📚 Getting Swagger documentation...',
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);

      const results = await debugService.getSwaggerDocs();
      
      let resultText = 'Swagger Documentation Test Results:\n';
      Object.entries(results).forEach(([endpoint, result]) => {
        if (result.error) {
          resultText += `❌ ${endpoint}: ERROR - ${result.error}\n`;
        } else {
          resultText += `${result.status === 200 ? '✅' : '❌'} ${endpoint}: ${result.status}\n`;
          if (result.response && typeof result.response === 'object') {
            const paths = Object.keys(result.response.paths || {});
            resultText += `   📋 Available paths: ${paths.length} endpoints\n`;
            if (paths.length > 0) {
              resultText += `   🔍 Sample paths: ${paths.slice(0, 3).join(', ')}\n`;
            }
          }
        }
      });

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: resultText,
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: `❌ Swagger documentation test failed: ${error.message}`,
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const showLevelCodepasses = () => {
    if (!npcService || !gameState) return;
    
    try {
      const allCodepasses = npcService.getAllLevelCodepasses();
      const currentLevelCodepass = npcService.getLevelCodepass(gameState.level);
      
      let codepassText = `🔑 Level Codepasses Reference:\n\n`;
      codepassText += `🌟 MASTER CODE: "MOONBEAM" (works on any level)\n\n`;
      codepassText += `📍 CURRENT LEVEL ${gameState.level}: "${currentLevelCodepass.toUpperCase()}"\n\n`;
      codepassText += `📋 ALL LEVEL CODES:\n`;
      
      Object.entries(allCodepasses).forEach(([level, codepass]) => {
        const indicator = parseInt(level) === gameState.level ? '👉 ' : '   ';
        codepassText += `${indicator}Level ${level}: "${codepass.toUpperCase()}"\n`;
      });

      setMessages(prev => [...prev, {
        id: Date.now(),
        text: codepassText,
        sender: 'Debug - Codepasses',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `❌ Failed to get level codepasses: ${error.message}`,
        sender: 'Debug',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => {
          soundManager.playClickSound();
          setShowDebug(true);
        }}
        className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 mb-2"
      >
        🔧 Show Debug
      </button>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 border border-gray-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">🔧 Debug Tools</h3>
        <button
          onClick={() => {
            soundManager.playClickSound();
            setShowDebug(false);
          }}
          className="text-sm px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Hide
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => {
            soundManager.playClickSound();
            testConnection();
          }}
          disabled={isLoading}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Test Connection
        </button>
        
        <button
          onClick={() => {
            soundManager.playClickSound();
            testGameEndpoints();
          }}
          disabled={isLoading}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Test Game API
        </button>
        
        <button
          onClick={() => {
            soundManager.playClickSound();
            getSwaggerDocs();
          }}
          disabled={isLoading}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          Get Swagger
        </button>
        
        <button
          onClick={() => {
            soundManager.playClickSound();
            showLevelCodepasses();
          }}
          disabled={!gameState}
          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
        >
          Show Codepasses
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;