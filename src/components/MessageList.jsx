import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  

  // Get message styling classes
  const getMessageStyle = (sender) => {
    const baseStyle = 'relative max-w-xs px-6 py-4 text-base leading-relaxed';
    
    switch (sender) {
      case 'You (Cat Player)':
        return `${baseStyle} bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-3xl rounded-br-md shadow-lg`;
      case 'Wolfy':
        return `${baseStyle} bg-gradient-to-br from-purple-100 to-purple-200 text-purple-900 rounded-3xl rounded-bl-md shadow-lg border-2 border-purple-300`;
      case 'Game Victory':
        return `${baseStyle} bg-gradient-to-br from-green-300 to-green-400 text-green-900 rounded-3xl shadow-xl border-2 border-green-500`;
      case 'Game':
        return `${baseStyle} bg-gradient-to-br from-amber-200 to-amber-300 text-amber-900 rounded-3xl rounded-bl-md shadow-lg border-2 border-amber-400`;
      case 'Error':
        return `${baseStyle} bg-gradient-to-br from-red-200 to-red-300 text-red-900 rounded-3xl shadow-lg border-2 border-red-400`;
      case 'Debug':
        return `${baseStyle} bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 rounded-3xl shadow-lg`;
      default:
        return `${baseStyle} bg-gradient-to-br from-indigo-200 to-indigo-300 text-indigo-900 rounded-3xl shadow-lg`;
    }
  };

  // Get message icon
  const getMessageIcon = (sender) => {
    switch (sender) {
      case 'You (Cat Player)': return '🐱';
      case 'Wolfy': return '🐺';
      case 'Game Victory': return '🏆';
      case 'Game': return '🎮';
      case 'Error': return '⚠️';
      case 'Debug': return '🔧';
      default: return '🔮';
    }
  };

  // Get tail styling for speech bubbles
  const getTailStyle = (sender) => {
    if (sender === 'You (Cat Player)') {
      return 'absolute -bottom-2 -right-1 w-4 h-4 bg-blue-500 transform rotate-45';
    }
    
    const baseStyle = 'absolute -bottom-2 -left-1 w-4 h-4 transform rotate-45';
    
    switch (sender) {
      case 'Wolfy':
        return `${baseStyle} bg-purple-200 border-l-2 border-b-2 border-purple-300`;
      case 'Game Victory':
        return `${baseStyle} bg-green-400 border-l-2 border-b-2 border-green-500`;
      case 'Game':
        return `${baseStyle} bg-amber-300 border-l-2 border-b-2 border-amber-400`;
      case 'Error':
        return `${baseStyle} bg-red-300 border-l-2 border-b-2 border-red-400`;
      case 'Debug':
        return `${baseStyle} bg-gray-300`;
      default:
        return `${baseStyle} bg-indigo-300`;
    }
  };

  // Empty state component
  const EmptyState = () => (
    <div className="text-center text-gray-500 py-8">
      <div className="text-6xl mb-4">🌉</div>
      <p className="text-xl font-medium">The bridge awaits...</p>
      <p className="text-base mt-2">Click PLAY GAME to begin your adventure!</p>
    </div>
  );

  return (
    <div className="messages-container flex-1 overflow-y-auto p-6 mb-4 min-h-0">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`mb-6 flex ${
              message.sender === 'You (Cat Player)' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={getMessageStyle(message.sender)}>
              <div className="flex items-center mb-2">
                <span className="text-lg font-bold">
                  {getMessageIcon(message.sender)}
                </span>
                <span className="text-xs opacity-70 ml-auto">{message.timestamp}</span>
              </div>
              <div className="whitespace-pre-wrap font-medium">
                {message.text}
              </div>
              
              {/* Speech bubble tail */}
              <div className={getTailStyle(message.sender)}></div>
            </div>
          </div>
        ))
      )}
      {/* Auto-scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;