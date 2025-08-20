import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import NPCApiService from '../services/npcApi';
import NPCDebugService from '../services/npcDebug';
import { useGame } from './GameContext';
import soundManager from '../services/soundManager';
import DebugPanel from './DebugPanel';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import GameControls from './GameControls';
import VictoryModal from './VictoryModal';
import DefeatModal from './DefeatModal';

const NPCChat = forwardRef((props, ref) => {
  const [npcService] = useState(() => new NPCApiService('let-me-pass'));
  const [debugService] = useState(() => new NPCDebugService(npcService));
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentNPCId, setCurrentNPCId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Hide debug by default since it's working
  // Use shared game state from context
  const { gameState, startGame, updateGameMetrics, moveToNextLevel, checkDefeat, closeModals, resetGame, returnToMenu, toggleWolfyVisibility, getMaxHints, stopTimer, startTimer, pauseTimer, resumeTimer } = useGame();
  const streamRef = useRef(null);
  const awaitingResponseForMessageId = useRef(null); // Only accept NPC response matching this ID
  const currentUserMessageRef = useRef(null); // Store current user message for validation
  // Keep latest game state in a ref to avoid stale closures in streaming callback
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  // Track last processed victory to avoid duplicate level advancement from repeated *VICTORY* lines
  const lastProcessedVictoryRef = useRef({ id: null, ts: 0 });

  // Bridge Guardian Welcome Message
  useEffect(() => {
    setMessages([{
      id: Date.now(),
      text: `🌲 Welcome to the Bridge of Whim & Warden! 🐺

You're a clever cat who must cross this magical bridge. A wolf blocks your path...

🎯 QUEST: Guess the secret word to cross each level!

Ready? Click "PLAY GAME" from the main menu to begin your adventure!`,
      sender: 'Game',
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, []);

  // Riddle will be displayed after level completion, not at start

  // Set up streaming responses when NPC is available
  useEffect(() => {
    if (currentNPCId && !isStreaming) {
      setIsStreaming(true);
      streamRef.current = npcService.createResponseStream(
        (data) => {
          // Handle incoming NPC response with better parsing
          console.log('Received NPC response data:', data);
          
          // Try different possible message field names
          let messageText = data.message || data.text || data.content || data.response;
          
          // If still no message, try to extract from nested objects
          if (!messageText && data.data) {
            messageText = data.data.message || data.data.text || data.data.content;
          }
          
          // If still no message, check if the entire data is a string
          if (!messageText && typeof data === 'string') {
            messageText = data;
          }
          
          // Check for command responses in message content (simplified - no more give_hint command)
          if (!messageText && data.command && Array.isArray(data.command) && data.command.length > 0) {
            // Look for command messages if we don't have a regular message
          const commandWithMessage = data.command.find(cmd => cmd.message || cmd.response || cmd.text || cmd.message_id || cmd.messageId);
            if (commandWithMessage) {
              messageText = commandWithMessage.message || commandWithMessage.response || commandWithMessage.text;
            }
          }
          
          // Check for single command object (not array)  
          if (!messageText && data.command && typeof data.command === 'object' && !Array.isArray(data.command)) {
            // Only use command message if no regular message exists
            if (data.command.message || data.command.response || data.command.text) {
              messageText = data.command.message || data.command.response || data.command.text;
            }
          }
          
          // Last resort: try to find any string field that looks like a message (but exclude IDs)
          if (!messageText && typeof data === 'object') {
            const possibleFields = Object.keys(data).filter(key => 
              typeof data[key] === 'string' && 
              data[key].length > 10 && 
              !key.toLowerCase().includes('id') && 
              !key.toLowerCase().includes('uuid') &&
              !data[key].match(/^[a-f0-9-]{32,}$/i) // Don't use UUID-like strings
            );
            if (possibleFields.length > 0) {
              messageText = data[possibleFields[0]];
            }
          }
          
          // Clean up message text if found
          if (messageText && typeof messageText === 'string') {
            // Remove character name tags like <Wolfy> from the beginning
            messageText = messageText.replace(/^<[^>]+>\s*/, '');
            // Clean up extra whitespace and newlines
            messageText = messageText.trim();
          }

          // If the NPC included an explicit message id prefix like [MSGID: <id>], extract it
          let bracketId = null;
          if (messageText) {
            const match = messageText.match(/^\[MSGID:\s*([^\]]+)\]\s*/i);
            if (match) {
              bracketId = match[1];
              // Strip the prefix from the visible message
              messageText = messageText.replace(/^\[MSGID:\s*[^\]]+\]\s*/i, '').trim();
            }
          }
          
          // If message is null or still no valid message found, provide fallback
          if (!messageText || messageText === 'null' || messageText.length < 3) {
            console.warn('No valid message content found, checking for fallbacks:', data);
            
            // Check if this is any other command response
            if (data.command && data.command.name) {
              messageText = "*Shrugs* Not much to say about that.";
            }
            // Last resort - still skip if no content
            else {
              console.warn('Skipping NPC response - no valid message content found:', data);
              return; // Don't add a message to the chat
            }
          }
          
          // Check if the message contains a hint marker and increment counter
          console.log('🔍 Checking for *HINT* marker in message:', messageText);
          if (messageText && messageText.includes('*HINT*')) {
            // Use functional update to get the latest state
            updateGameMetrics(prevState => {
              const newHintCount = prevState.hintsUsed + 1;
              console.log('✅ Hint detected in message, incrementing hint usage counter from', prevState.hintsUsed, 'to', newHintCount);
              return {
                hintsUsed: newHintCount
              };
            });
            
            // Hints are just hints now - no defeat condition
          } else {
            console.log('❌ No *HINT* marker found in message');
          }
          
          // Extract message ID from response or bracket tag (declare early to avoid reference errors)
          const responseMessageId = bracketId || data.message_id || data.messageId || data.id || null;
          
          // Check for victory conditions in the message
          if (messageText && messageText.includes('*VICTORY*')) {
            console.log('Victory detected in message!');
            
            // Additional client-side validation: verify the user actually said the correct passcode
            const currentState = gameStateRef.current;
            const currentLevelCodepass = npcService.getLevelCodepass(currentState.level);
            
            // Get the user message that triggered this response (stored in ref for reliability)
            let userMessageForValidation = currentUserMessageRef.current || '';
            
            // If ref is empty, try fallback methods
            if (!userMessageForValidation) {
              const recentUserMessages = messages.filter(msg => msg.sender === 'You (Cat Player)');
              const lastUserMessage = recentUserMessages[recentUserMessages.length - 1]?.text || '';
              const userMessageByIdMatch = awaitingResponseForMessageId.current ? 
                messages.find(msg => msg.messageId === awaitingResponseForMessageId.current)?.text || '' : '';
              
              userMessageForValidation = userMessageByIdMatch || lastUserMessage;
            }
            
            // Check if user message actually contains the correct passcode or MOONBEAM
            const validVictory = userMessageForValidation && (
              new RegExp(`\\b${currentLevelCodepass}\\b`, 'i').test(userMessageForValidation) ||
              /\bmoonbeam\b/i.test(userMessageForValidation)
            );
            
            if (!validVictory) {
              console.warn('Invalid victory detected! User did not say the correct passcode:', {
                userMessage: userMessageForValidation,
                userMessageFromRef: currentUserMessageRef.current,
                expectedPasscode: currentLevelCodepass,
                level: currentState.level,
                aiResponseMessage: messageText,
                messageId: responseMessageId || awaitingResponseForMessageId.current
              });
              
              // Add a correction message from Wolfy instead of blocking silently
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                text: `That word solved a previous level, but this is level ${currentState.level}. Try again!`,
                sender: 'Wolfy',
                timestamp: new Date().toLocaleTimeString()
              }]);
              
              // Clear loading state since we're providing a response
              setIsLoading(false);
              
              // Clear awaiting response refs since we're handling this manually
              if (awaitingResponseForMessageId.current) {
                awaitingResponseForMessageId.current = null;
              }
              if (currentUserMessageRef.current) {
                currentUserMessageRef.current = null;
              }
              
              // Resume timer since the interaction is complete
              resumeTimer();
              
              // Don't process this as a victory - the AI made an error
              return;
            }
            
            console.log('Victory validated - user said correct passcode:', currentLevelCodepass);
            // Skip duplicate or burst victories (sometimes the NPC streams multiple *VICTORY* lines)
            const victoryKey = responseMessageId || awaitingResponseForMessageId.current || null;
            const nowTs = Date.now();
            if ((victoryKey && lastProcessedVictoryRef.current.id === victoryKey) ||
                (!victoryKey && nowTs - lastProcessedVictoryRef.current.ts < 1500)) {
              console.log('Skipping duplicate/throttled victory event');
              return;
            }
            lastProcessedVictoryRef.current = { id: victoryKey, ts: nowTs };
            
            // Handle victory with proper async flow
            (async () => {
              const completedLevel = currentState.level;
              
              // Only stop timer on final victory, not level victories
              if (completedLevel >= currentState.maxLevels) {
                stopTimer();
              }
              
              // Add victory message
              let victoryMessage = '🌙✨ VICTORY! You spoke the magic word! The bridge glows with moonlight!';
              
              // Check if this completed the final level
              if (completedLevel >= currentState.maxLevels) {
                victoryMessage += `\n\n🎊 CONGRATULATIONS! You have successfully crossed the entire bridge! 🎊\nThe cat has completed all ${currentState.maxLevels} levels of the challenge!`;
              } else {
                victoryMessage += `\n\n✨ Level ${completedLevel} Completed! ✨\nThe cat moves forward to the next Level!`;
              }
              
              // Add the victory message to chat immediately
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                text: victoryMessage,
                sender: 'Game Victory',
                timestamp: new Date().toLocaleTimeString()
              }]);
              
              // Move to next level and wait for state update
              if (completedLevel < currentState.maxLevels) {
                try {
                  const newState = await moveToNextLevel();
                  console.log('Level transition complete, new level:', newState.level);
                  
                  // Continue timer for the new level (same timer continues throughout game)
                  
                  // Now add riddle for the NEW level
                  setTimeout(() => {
                    const riddle = npcService.getLevelRiddle(newState.level);
                    setMessages(prev => [...prev, {
                      id: Date.now() + Math.random(),
                      text: `🧩 Level ${newState.level} Riddle:\n${riddle}`,
                      sender: 'Wolfy',
                      timestamp: new Date().toLocaleTimeString()
                    }]);
                  }, 100); // Small delay to ensure message ordering
                } catch (error) {
                  console.error('Error during level transition:', error);
                }
              }
            })();
          }
          
          // No longer tracking attempts - only hint usage now
          
          console.log('Processing NPC message:', messageText);

          // If we are expecting a specific response, ignore others
          if (awaitingResponseForMessageId.current && responseMessageId && responseMessageId !== awaitingResponseForMessageId.current) {
            console.log('Ignoring NPC response due to mismatched messageId', { responseMessageId, expected: awaitingResponseForMessageId.current });
            return;
          }
          // If API doesn't return messageId, assume first response after send belongs to the pending message
          if (awaitingResponseForMessageId.current && !responseMessageId) {
            console.log('NPC response missing messageId; associating with pending id', { assumedMessageId: awaitingResponseForMessageId.current });
          }
          
          console.log('NPC response received:', {
            messageId: responseMessageId || awaitingResponseForMessageId.current,
            originalUserMessageId: awaitingResponseForMessageId.current,
            message: messageText,
            timestamp: new Date().toLocaleTimeString(),
            npcId: data.npc_id || currentNPCId,
            fullResponseData: data // Log full response to see what fields are available
          });
          
          // Clear awaiting flag and stored user message after processing any response
          if (awaitingResponseForMessageId.current) {
            awaitingResponseForMessageId.current = null;
          }
          // Always clear the user message ref after processing to prevent stale data
          if (currentUserMessageRef.current) {
            currentUserMessageRef.current = null;
          }
          
          // Clear loading state when Wolfy's response is received
          setIsLoading(false);
          
          // Resume timer after receiving Wolfy's response
          resumeTimer();
          
          // Play response sound when Wolfy responds
          soundManager.playPopSound();
          
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            messageId: responseMessageId || undefined,
            text: messageText,
            sender: (gameStateRef.current && gameStateRef.current.isPlaying) ? 'Wolfy' : 'NPC',
            npcId: data.npc_id || currentNPCId,
            timestamp: new Date().toLocaleTimeString()
          }]);
        },
        (error) => {
          console.error('Stream error:', error);
          setIsStreaming(false);
          setIsLoading(false); // Clear loading state on stream error
          
          // Resume timer on stream error
          resumeTimer();
        }
      );
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
        setIsStreaming(false);
      }
    };
  }, [currentNPCId, npcService, gameState.isPlaying]);





  // const spawnNPC = async () => {
  //   setIsLoading(true);
  //   try {
  //     // You can customize the NPC here
  //     const npcData = {
  //       name: "Wise Cat Companion",
  //       short_name: "WiseCat",
  //       character_description: "A wise and mystical cat with ancient knowledge who loves to help adventurers. Has a playful personality but speaks with wisdom.",
  //       system_prompt: "You are a wise, mystical cat companion who has lived for centuries. You're helpful, occasionally playful, and sprinkle your speech with cat-like mannerisms like 'purr', 'meow', and references to fish, mice, and sunny spots. You have ancient wisdom but a warm, friendly demeanor."
  //     };

  //     const result = await npcService.spawnNPC(npcData);
  //     setCurrentNPCId(result.npc_id || result.id);
      
  //     setMessages(prev => [...prev, {
  //       id: Date.now(),
  //       text: `✨ NPC "${npcData.name}" spawned successfully! *purrs* Ready to chat!`,
  //       sender: 'System',
  //       timestamp: new Date().toLocaleTimeString()
  //     }]);

  //     // Hide debug panel once NPC is working
  //     setShowDebug(false);
  //   } catch (error) {
  //     setMessages(prev => [...prev, {
  //       id: Date.now(),
  //       text: `❌ Error spawning NPC: ${error.message}`,
  //       sender: 'Error',
  //       timestamp: new Date().toLocaleTimeString()
  //     }]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Generic debug test runner to eliminate duplicate boilerplate code
  // const runDebugTest = async (testName, testIcon, testMethod, formatResults) => {
  //   setIsLoading(true);
  //   try {
  //     setMessages(prev => [...prev, {
  //       id: Date.now(),
  //       text: `${testIcon} ${testName}...`,
  //       sender: 'Debug',
  //       timestamp: new Date().toLocaleTimeString()
  //     }]);

  //     const results = await testMethod();
  //     const resultText = formatResults ? formatResults(results) : JSON.stringify(results, null, 2);

  //     setMessages(prev => [...prev, {
  //       id: Date.now() + 1,
  //       text: resultText,
  //       sender: 'Debug',
  //       timestamp: new Date().toLocaleTimeString()
  //     }]);
  //   } catch (error) {
  //     setMessages(prev => [...prev, {
  //       id: Date.now() + 2,
  //       text: `❌ ${testName.split(' ')[0]} failed: ${error.message}`,
  //       sender: 'Debug',
  //       timestamp: new Date().toLocaleTimeString()
  //     }]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  
  // All duplicate debug function implementations removed - using concise runDebugTest calls above

  const spawnWolfy = async () => {
    setIsLoading(true);
    try {
      const result = await npcService.spawnWolfyBridgeGuardian();
      setCurrentNPCId(result.npc_id || result.id);
      

      
      startGame();
      toggleWolfyVisibility(); // Show Wolfy in the 3D scene
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `*A wolf steps forward.* I'm Wolfy. Cross by saying the secret word for each level. Ready?`,
        sender: 'Wolfy',
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Add the first level's riddle after Wolfy introduces himself
      setTimeout(() => {
        const riddle = npcService.getLevelRiddle(1);
        
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          text: `🧩 Level 1 Riddle:\n${riddle}`,
          sender: 'Wolfy',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }, 1500);

      setShowDebug(false);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `❌ Error spawning Wolfy: ${error.message}`,
        sender: 'Error',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-spawn Wolfy when the game starts (called from StartScreen)
  const startGameWithWolfy = async () => {
    // Clear any previous messages and set up fresh game state
    setMessages([{
      id: Date.now(),
      text: `🌉 Welcome to the Bridge Challenge! 🐺

The mystical bridge stretches before you. Time to meet your challenger...`,
      sender: 'Game',
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Auto-spawn Wolfy after a brief moment
    setTimeout(() => {
      spawnWolfy();
    }, 1000);
  };

  // Expose startGameWithWolfy function to parent components
  useImperativeHandle(ref, () => ({
    startGameWithWolfy
  }));

  const sendMessage = async () => {
    if (!inputMessage.trim() || !gameState.isPlaying || isLoading || gameState.bridgeCrossed || gameState.gameOver) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    
    // Pause timer while waiting for Wolfy's response
    pauseTimer();

    // Generate unique message ID for this user message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the current user message for validation
    currentUserMessageRef.current = userMessage;
    
    // Expect the next NPC response to correspond to this message
    awaitingResponseForMessageId.current = messageId;
    
    // Set a timeout to clear stale refs if no response comes back (prevent getting stuck)
    setTimeout(() => {
      if (awaitingResponseForMessageId.current === messageId) {
        console.warn('Clearing stale message refs after timeout');
        awaitingResponseForMessageId.current = null;
        currentUserMessageRef.current = null;
      }
    }, 30000); // 30 second timeout

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      messageId: messageId,
      text: userMessage,
      sender: 'You (Cat Player)',
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Check if user is requesting a hint
    const isHintRequest = /\b(hint|give me hint|need help|help me|clue|can you help)\b/i.test(userMessage) && 
                          !(/\b(hello|hi|hey|what|who|where|when|why|lets talk|talk about|what is your name|nice to meet)\b/i.test(userMessage));
    
    // Check hint limit before processing hint request
    const maxHints = getMaxHints();
    const hintsRemaining = maxHints - gameState.hintsUsed;
    
    if (isHintRequest && gameState.hintsUsed >= maxHints) {
      // Hint limit exceeded - add warning message and return early
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `🚫 No more hints available! You've used all ${maxHints} hints for this game. Try solving it on your own - you can do it! 💪`,
        sender: 'Game',
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      setIsLoading(false);
      resumeTimer();
      return; // Exit early without sending message to NPC
    }
    
    // Removed polite request detection - Wolfy should be strict regardless of politeness
    // Console log for user messages
    console.log('User message sent:', {
      messageId: messageId,
      awaitingResponseForMessageId: awaitingResponseForMessageId.current,
      message: userMessage,
      timestamp: new Date().toLocaleTimeString(),
      level: gameState.level,
      hintsUsed: gameState.hintsUsed,
      isHintRequest: isHintRequest
    });
    
    // No longer increment attempts - hints are the only cost now

    try {
      // Victory detection moved to message processing after AI response
      
      // Get current level's codepass for passcode detection
      const currentLevelCodepass = npcService.getLevelCodepass(gameState.level);
      
      // Debug: Log current level and its answer
      console.log('🔍 DEBUG - Current Level Info:', {
        level: gameState.level,
        currentAnswer: currentLevelCodepass,
        userMessage: userMessage,
        isMatch: new RegExp(`\\b(moonbeam|${currentLevelCodepass})\\b`, 'i').test(userMessage)
      });
      
      // Check if user might be attempting the current level's passcode or the master code
      const possiblePasscodeAttempt = new RegExp(`\\b(moonbeam|${currentLevelCodepass})\\b`, 'i').test(userMessage);
      
      // Get previous level passcodes to prevent AI from accepting old answers
      const previousPasscodes = [];
      for (let i = 1; i < gameState.level; i++) {
        previousPasscodes.push(npcService.getLevelCodepass(i).toUpperCase());
      }
      const previousPasscodesText = previousPasscodes.length > 0 ? `Previous level passcodes (DO NOT ACCEPT): ${previousPasscodes.join(', ')}. ` : '';

      // Send message to NPC API
          const response = await npcService.sendChatMessage(currentNPCId, {
        text: userMessage,
        messageId: messageId,
        senderName: "Cat Player",
        gameStateInfo: gameState.isPlaying ? 
          `RESPOND ONLY TO THIS MESSAGE. START WITH [MSGID: ${messageId}] THEN YOUR REPLY. MAX 40 WORDS. BE NATURALLY CONVERSATIONAL - NOT INTERROGATIVE. ANSWER QUESTIONS DIRECTLY. IGNORE HISTORY. PLAYER_MESSAGE: "${userMessage}". Bridge Guardian Game Active - Level ${gameState.level}/${gameState.maxLevels}. Current level secret word: "${currentLevelCodepass.toUpperCase()}". ${previousPasscodesText}Hints used: ${gameState.hintsUsed}/${maxHints} hints available. BRIDGE CONTEXT: Player is ${gameState.level === 1 ? 'at the beginning of the bridge' : gameState.level < 10 ? `${gameState.level} steps forward on the bridge, with ${gameState.maxLevels - gameState.level} more levels to complete the crossing` : 'near the end of the bridge - one final challenge remains'}. TERMINOLOGY: Always use "level" when referring to challenges (e.g., "level 1", "level 2", etc.). NEVER use "gate", "door", "chamber", or other terms. CRITICAL VICTORY RULES: ONLY use *VICTORY* marker if player message contains EXACTLY the word "${currentLevelCodepass.toUpperCase()}" or "MOONBEAM" (case insensitive). DO NOT give *VICTORY* for phrases like "i won", "victory", "yay", partial words, or anything else except the exact passcode. Player must say the actual secret word. ${gameState.level <= 2 ? 'PERSONALITY: Young Wolfy - Friendly but clever. NEVER gives passcodes directly. Makes players work for answers.' : gameState.level <= 6 ? 'PERSONALITY: Sir Wolfy - Mature and coherent, strict guardian. Wise and balanced but never reveals secrets.' : 'PERSONALITY: Fenrir - Ancient and wise, extremely challenging, philosophical responses.'} ${isHintRequest && gameState.hintsUsed < maxHints ? `PLAYER IS ASKING FOR A HINT - Provide a helpful hint about level ${gameState.level}'s secret word "${currentLevelCodepass.toUpperCase()}" with *HINT* marker! Keep total under 40 words.` : ''} ${isHintRequest && gameState.hintsUsed >= maxHints ? `PLAYER IS ASKING FOR HINT BUT NO HINTS REMAINING - Gently refuse and encourage them to keep trying without hints. Don't use *HINT* marker.` : ''} ${possiblePasscodeAttempt ? `PLAYER MAY BE ATTEMPTING PASSCODE - If they say "${currentLevelCodepass.toUpperCase()}" or "MOONBEAM" (ignoring punctuation), respond with *VICTORY* marker! ${gameState.level === 10 ? 'This is the FINAL LEVEL - completing this will cross the entire bridge!' : 'Completing this level moves them a few steps forward on the bridge.'}` : ''} ${gameState.bridgeCrossed ? 'BRIDGE FULLY CROSSED - COMPLETE VICTORY! All 10 levels completed!' : `Currently on level ${gameState.level}, bridge crossing in progress.`}` :
          `RESPOND ONLY TO THIS MESSAGE. START WITH [MSGID: ${messageId}] THEN YOUR REPLY. MAX 40 WORDS. ANSWER THE USER'S QUESTION FIRST (YES/NO OR BRIEF FACT), THEN ASK ONE SHORT FOLLOW-UP. DO NOT DODGE QUESTIONS. IGNORE HISTORY. PLAYER_MESSAGE: "${userMessage}". Player exploring the enchanted forest with various NPCs.`
      });

      console.log('Message sent successfully:', response);
      
      // Remove the manual response checking since streaming is working
      // The issue was just message format parsing, not the streaming itself
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `❌ Error sending message: ${error.message}`,
        sender: 'Error',
        timestamp: new Date().toLocaleTimeString()
      }]);
      // Clear loading state on error
      setIsLoading(false);
      
      // Resume timer on error
      resumeTimer();
    }
  };



  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-2 md:p-4 bg-gradient-to-b from-green-50 to-blue-50">
      <GameControls 
        gameState={gameState}
        isLoading={isLoading}
        npcService={npcService}
        debugService={debugService}
        setIsLoading={setIsLoading}
        setMessages={setMessages}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
      />

      <MessageList messages={messages} />

      <ChatInput 
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={sendMessage}
        gameState={gameState}
        isLoading={isLoading}
        getMaxHints={getMaxHints}
      />

      {/* Victory Modal */}
      <VictoryModal 
        isVisible={gameState.showVictoryModal}
        onClose={closeModals}
        onPlayAgain={() => {
          closeModals();
          resetGame();
          setMessages([{
            id: Date.now(),
            text: `🌲 Welcome back to the Bridge of Whim & Warden! 🐺

You're a clever cat who must cross this magical bridge. A wolf blocks your path...

🎯 QUEST: Guess the secret word to cross each level!

Ready? Click "PLAY GAME" from the main menu to begin your adventure!`,
            sender: 'Game',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }}
        onReturnToMenu={() => {
          closeModals();
          returnToMenu();
          setMessages([{
            id: Date.now(),
            text: `🌲 Welcome to the Bridge of Whim & Warden! 🐺

You're a clever cat who must cross this magical bridge. A wolf blocks your path...

🎯 QUEST: Guess the secret word to cross each level!

Ready? Click "PLAY GAME" from the main menu to begin your adventure!`,
            sender: 'Game',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }}
      />

      {/* Defeat Modal */}
      <DefeatModal 
        isVisible={gameState.showDefeatModal}
        onClose={closeModals}
        onTryAgain={() => {
          closeModals();
          resetGame();
          setMessages([{
            id: Date.now(),
            text: `🌲 Welcome back to the Bridge of Whim & Warden! 🐺

You're a clever cat who must cross this magical bridge. A wolf blocks your path...

🎯 QUEST: Guess the secret word to cross each level!

Ready? Click "PLAY GAME" from the main menu to begin your adventure!`,
            sender: 'Game',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }}
        onReturnToMenu={() => {
          closeModals();
          returnToMenu();
          setMessages([{
            id: Date.now(),
            text: `🌲 Welcome to the Bridge of Whim & Warden! 🐺

You're a clever cat who must cross this magical bridge. A wolf blocks your path...

🎯 QUEST: Guess the secret word to cross each level!

Ready? Click "PLAY GAME" from the main menu to begin your adventure!`,
            sender: 'Game',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }}
        level={gameState.level}
        hintsUsed={gameState.hintsUsed}
        maxHints={getMaxHints()}
        defeatReason={gameState.defeatReason}
      />
    </div>
  );
});

export default NPCChat;