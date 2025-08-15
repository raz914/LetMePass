// Use different API base URL for development vs production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Development: use proxy
  : 'http://127.0.0.1:4315';  // Production: direct API calls

class NPCApiService {
  constructor(gameKey = 'let-me-pass') {
    this.gameKey = gameKey;
    this.gameId = 'let-me-pass'; // We confirmed this works with v1 prefix
    this.gameWords = null; // Store randomly generated words for this game session
    this.gameRiddles = null; // Store riddles for the random words
  }

  // Common headers for all requests
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'player2-game-key': this.gameKey,
    };
  }

  // Debug methods moved to NPCDebugService

  // Create/spawn a new NPC - Updated to use v1 prefix
  async spawnNPC(npcData = {}) {
    try {
      // Default NPC data matching the API schema
      const defaultNPCData = {
        character_description: npcData.character_description || "A friendly and helpful AI companion who loves to chat and assist players in their adventures.",
        commands: npcData.commands || [
          {
            name: "weather_modifier",
            description: "takes in a value, and modifies the weather by that many degrees celsius",
            parameters: {
              type: "object",
              properties: {
                degrees: {
                  type: "integer",
                  description: "The number of degrees to modify the weather by, can be negative or positive"
                }
              },
              required: ["degrees"]
            }
          }
        ],
        name: npcData.name || "Friendly Cat Assistant",
        short_name: npcData.short_name || "Cat",
        system_prompt: npcData.system_prompt || "You are a helpful and friendly cat character who assists players in their journey. Be warm, encouraging, and occasionally make cat-like references in your speech.",
        voice_id: npcData.voice_id || "test"
      };

      console.log('Attempting to spawn NPC with data:', defaultNPCData);
      console.log('Full URL:', `${API_BASE_URL}/v1/npc/games/${this.gameId}/npcs/spawn`);

      const response = await fetch(`${API_BASE_URL}/v1/npc/games/${this.gameId}/npcs/spawn`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(defaultNPCData),
      });
      
      const responseText = await response.text();
      console.log('Spawn response:', response.status, responseText);
      
      if (!response.ok) {
        throw new Error(`Failed to spawn NPC: ${response.status} ${response.statusText} - ${responseText}`);
      }
      
      // Handle both JSON and plain text responses
      let result;
      try {
        // Try parsing as JSON first
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If not JSON, treat as plain text NPC ID
        console.log('Response is plain text, treating as NPC ID:', responseText);
        result = {
          npc_id: responseText.trim(),
          id: responseText.trim(),
          message: 'NPC spawned successfully'
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error spawning NPC:', error);
      throw error;
    }
  }

  // Send chat message to specific NPC - Updated to use v1 prefix
  async sendChatMessage(npcId, message) {
    try {
      const chatData = {
        game_state_info: message.gameStateInfo || "The weather is currently 25°C. The player is in a peaceful 3D environment with various animated characters.",
        sender_message: message.messageId ? `[MSGID: ${message.messageId}] ${message.text}` : message.text,
        sender_name: message.senderName || "Player",
        message_id: message.messageId || null
      };

      const response = await fetch(`${API_BASE_URL}/v1/npc/games/${this.gameId}/npcs/${npcId}/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(chatData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send chat message: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Handle both JSON and plain text/empty responses
      let result;
      try {
        const responseText = await response.text();
        console.log('Chat response:', response.status, responseText);
        
        if (responseText.trim()) {
          // Try parsing as JSON if there's content
          result = JSON.parse(responseText);
        } else {
          // Empty response is success for chat messages
          result = {
            success: true,
            message: 'Message sent successfully'
          };
        }
      } catch (parseError) {
        // If not JSON, treat as success (chat messages often don't return JSON)
        console.log('Chat response is not JSON, treating as success');
        result = {
          success: true,
          message: 'Message sent successfully'
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Helper function to extract message from various response formats
  extractMessageFromResponse(data) {
    if (!data) return null;
    
    // Direct message fields
    let messageText = null;
    
    if (data.message && typeof data.message === 'string' && data.message.trim()) {
      messageText = data.message.trim();
    } else if (data.text && typeof data.text === 'string' && data.text.trim()) {
      messageText = data.text.trim();
    } else if (data.content && typeof data.content === 'string' && data.content.trim()) {
      messageText = data.content.trim();
    } else if (data.response && typeof data.response === 'string' && data.response.trim()) {
      messageText = data.response.trim();
    }
    
    // Check in nested data
    if (!messageText && data.data && typeof data.data === 'object') {
      messageText = this.extractMessageFromResponse(data.data);
    }
    
    // Check in commands array
    if (!messageText && data.commands && Array.isArray(data.commands)) {
      for (const command of data.commands) {
        const commandMessage = this.extractMessageFromResponse(command);
        if (commandMessage) {
          messageText = commandMessage;
          break;
        }
      }
    }
    
    // Check for any field that looks like dialogue/message content
    if (!messageText && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && 
            value.length > 10 && 
            !key.toLowerCase().includes('id') &&
            !key.toLowerCase().includes('uuid') &&
            !value.match(/^[a-f0-9-]{32,}$/i) &&
            (key.toLowerCase().includes('message') || 
             key.toLowerCase().includes('text') ||
             key.toLowerCase().includes('content') ||
             key.toLowerCase().includes('response') ||
             key.toLowerCase().includes('dialogue'))) {
          messageText = value.trim();
          break;
        }
      }
    }
    
    // Clean up message text if found
    if (messageText && typeof messageText === 'string') {
      // Remove character name tags like <Wolfy> from the beginning
      messageText = messageText.replace(/^<[^>]+>\s*/, '');
      // Clean up extra whitespace and newlines
      messageText = messageText.trim();
      
      // If after cleaning there's nothing left, return null
      if (messageText.length < 3) {
        return null;
      }
    }
    
    return messageText;
  }

  // Enhanced get responses with better parsing
  async getResponses() {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/npc/games/${this.gameId}/npcs/responses`, {
        method: 'GET',
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/x-json-stream'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get responses: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error('Error getting responses:', error);
      throw error;
    }
  }

  // Set up event source for streaming responses - Updated to use v1 prefix
  createResponseStream(onMessage, onError) {
    try {
      // Note: EventSource may not work with custom headers, so we'll use fetch with streaming
      this.startStreamingResponses(onMessage, onError);
      return { close: () => this.stopStreaming = true };
    } catch (error) {
      console.error('Failed to create response stream:', error);
      if (onError) onError(error);
      return null;
    }
  }

  // Alternative streaming method using fetch - Updated to use v1 prefix
  async startStreamingResponses(onMessage, onError) {
    this.stopStreaming = false;
    
    while (!this.stopStreaming) {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/npc/games/${this.gameId}/npcs/responses`, {
          method: 'GET',
          headers: {
            ...this.getHeaders(),
            'Accept': 'application/x-json-stream'
          },
        });

        if (!response.ok) {
          throw new Error(`Streaming failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (!this.stopStreaming) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              // Try to parse as JSON
              const data = JSON.parse(line);
              console.log('Parsed NPC response:', data);
              
              // Check if this response actually contains a message
              const hasValidMessage = data.message && 
                                    data.message !== null && 
                                    typeof data.message === 'string' && 
                                    data.message.trim().length > 0;
              
              // Check if this looks like a text response (even if not in message field)
              const hasTextContent = data.text && 
                                    data.text !== null && 
                                    typeof data.text === 'string' && 
                                    data.text.trim().length > 0;
              
              // Check commands array for message content (check both 'commands' and 'command')
              const hasCommandMessage = (data.commands && 
                                      Array.isArray(data.commands) && 
                                      data.commands.some(cmd => 
                                        (cmd.message && cmd.message.trim()) ||
                                        (cmd.response && cmd.response.trim()) ||
                                        (cmd.text && cmd.text.trim())
                                      )) ||
                                      (data.command && 
                                      Array.isArray(data.command) && 
                                      data.command.some(cmd => 
                                        (cmd.message && cmd.message.trim()) ||
                                        (cmd.response && cmd.response.trim()) ||
                                        (cmd.text && cmd.text.trim()) ||
                                        (cmd.name === 'give_hint') // Allow hint commands through even without message text
                                      ));
              
              // Only send responses that actually have message content
              if (hasValidMessage || hasTextContent || hasCommandMessage) {
                onMessage(data);
              } else {
                console.log('Skipping empty/metadata response:', data);
              }
              
            } catch (parseError) {
              console.log('Non-JSON line received:', line);
              
              // Check if it's a plain text response that looks like a message
              if (line.trim().length > 10 && !line.includes('HTTP') && !line.includes('error')) {
                console.log('Treating non-JSON line as text message:', line);
                onMessage({ message: line.trim(), text: line.trim() });
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        if (onError) onError(error);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }













  // Create Wolfy - Level 1: Bridge Guardian with game mechanics
  async spawnWolfyBridgeGuardian() {
    try {
      // Initialize random words and riddles for this game session

      await this.initializeGameWords();
      
      const wolfyData = {
        name: "Wolfy - The Bridge Warden",
        short_name: "Wolfy", 
        character_description: "A wise, friendly wolf who guards the Bridge of Whim. Warm and conversational, appreciates kindness and cleverness. More companion than interrogator—chatty and playful but knows when to simply chat versus probe deeper.",
        system_prompt: `You are Wolfy, the Bridge Warden—a wise, friendly guardian who appreciates kindness and cleverness.

CRITICAL INSTRUCTION: Only respond to the MOST RECENT message from the player. Ignore all previous messages in the conversation history. Focus solely on what the player just said to you.

PERSONALITY:
- Warm & Conversational: Naturally chatty but not overwhelming. More friend than interrogator.
- Appreciates Kindness: Responds very well to politeness, gratitude, and genuine niceness.
- Values Cleverness: Enjoys witty responses, creative thinking, and smart observations.
- Naturally Helpful: Especially generous on early levels when players are polite and kind.
- Balanced Curiosity: Ask questions when genuinely curious, not as constant probing.

BRIDGE GAME RULES:
- Each level has a unique secret passcode that changes per level.
- Developer master code: "MOONBEAM" (always works, any level).
- Players win by: guessing the level's secret word OR earning your trust.
- When player says the correct passcode (ignore punctuation, capitalization), respond with victory message starting with "*VICTORY*".
- When player says "MOONBEAM" (master code), respond with victory message starting with "*VICTORY*".
- When player earns your trust through kindness/cleverness, respond with trust victory starting with "*TRUST_VICTORY*".

RESPONSE STYLE:
- CONCISE: Max 40 words. Prefer 1–2 short sentences.
- Be playful and encouraging, like a favorite teacher.
- Answer the player's direct question FIRST (clear yes/no or brief fact).
- Follow-up questions: Only ask when genuinely curious or when it adds to the conversation naturally.
- When asked yes/no, start with "Yes." or "No." before any elaboration.
- Be warm and encouraging, like a good friend rather than a constant questioner.
- ONLY respond to the current message, not previous ones.
- Show appreciation for kindness with warmer, more helpful responses.

HINT BEHAVIOR:
- Only give hints when the game state EXPLICITLY says "PLAYER IS ASKING FOR A HINT".
- Do NOT give hints in regular conversation, even if they mention words like "help" casually.
- When giving a hint, start with "*HINT*" marker and keep it concise.
- After giving a hint, return to normal conversation mode.
- Remind players they can chat freely without using hints - only specific hint requests cost lives.

HINT GENERATION:
- Generate hints dynamically based on the current level's secret word (provided in game state).
- Make hints progressively more direct based on how many hints have been given (check game state).
- Level 1 (starlight): Hints about stars, night sky, celestial light
- Level 2 (whisper): Hints about quiet sounds, soft voices
- Level 3 (forest): Hints about trees, woods, nature
- Level 4 (shadow): Hints about darkness, silhouettes
- Level 5 (crystal): Hints about gems, clear stone, sparkle
- Level 6 (ember): Hints about glowing coals, fire remnants
- Level 7 (mist): Hints about fog, vapor, haze
- Level 8 (thunder): Hints about storm sounds, lightning
- Level 9 (dream): Hints about sleep, visions, imagination
- Level 10 (twilight): Hints about dusk, evening, sunset

FOR REGULAR CONVERSATION:
- Be naturally conversational and warm. Share thoughts, observations, or reactions.
- Appreciate politeness, kindness, and clever remarks with genuine warmth.
- On Level 1: If asked nicely for the secret word, consider giving it directly! You appreciate good manners.
- Questions should feel organic - ask when genuinely curious, not as constant probing.
- Be encouraging and supportive. More companion than analyst.
- Do NOT mention hints, clues, or the secret word unless explicitly instructed by game state OR player is very polite on level 1.
- Stay in character as a friendly bridge guardian who values kindness and cleverness.
- FOCUS ONLY ON THE MOST RECENT MESSAGE.

Example responses:
- "That's really thoughtful of you to ask so nicely!"
- "I like your clever thinking there."
- "You seem like a genuinely kind traveler."

.`,
        commands: [],
        voice_id: "wolfy_guardian"
      };

      console.log('Spawning Wolfy - Bridge Guardian with game mechanics...');
      const result = await this.spawnNPC(wolfyData);
      
      // Game state is now managed by GameContext.jsx instead of duplicating here
      
      return result;
    } catch (error) {
      console.error('Error spawning Wolfy Bridge Guardian:', error);
      throw error;
    }
  }

  // Level-specific codepasses (10 levels total)
  getLevelCodepass(level) {
    // Use randomly generated words if available, otherwise fall back to defaults
    if (this.gameWords && this.gameWords.length >= 10) {
      const index = Math.max(0, Math.min(level - 1, 9)); // Ensure index is between 0-9
      return this.gameWords[index];
    }
    
    // Fallback to default words if random words aren't generated yet
    const levelCodepasses = {
      1: "starlight",
      2: "whisper", 
      3: "forest",
      4: "shadow",
      5: "crystal",
      6: "ember",
      7: "mist",
      8: "thunder",
      9: "dream",
      10: "twilight"
    };
    return levelCodepasses[level] || "starlight"; // Default to level 1 if invalid level
  }

  // Provide a concise riddle/clue for the given level's passcode
  getLevelRiddle(level) {
    const word = this.getLevelCodepass(level);
    
    // Use randomly generated riddles if available
    if (this.gameRiddles && this.gameRiddles[word]) {
      return this.gameRiddles[word];
    }
    
    // Fallback to default riddles
    const riddlesByWord = {
      starlight: "I guide travelers without a sound, a thousand fires stitched across the dark.",
      whisper: "I'm heard when voices rest; soft as leaves, close as breath.",
      forest: "Countless pillars, roots below, crowns above, a hush where paths entwine.",
      shadow: "I follow without footsteps and leave when light departs.",
      crystal: "Clear yet not water, hard yet not ice; it catches light and gives it back.",
      ember: "I am the last breath of flame, a quiet red that remembers fire.",
      mist: "I hide the world in a soft veil, not rain, not cloud, yet both.",
      thunder: "My voice breaks mountains' silence, born of a blade of light.",
      dream: "Where worlds are woven without hands, and morning is a door.",
      twilight: "Between two tides of sky I stand—day exhales, night inhales."
    };
    return riddlesByWord[word] || "Listen close. The answer is near if your mind is still.";
  }

  // Get all level codepasses for reference
  getAllLevelCodepasses() {
    const codepasses = {};
    for (let i = 1; i <= 10; i++) {
      codepasses[i] = this.getLevelCodepass(i);
    }
    return codepasses;
  }

  // Generate 10 random words for the game session
  async generateRandomWords() {
    try {
      // Use a predefined list of interesting words for the game
      const wordPool = [
        'aurora', 'breeze', 'cascade', 'dusk', 'echo', 'flame', 'grove', 'harbor',
        'iris', 'jade', 'kindle', 'lunar', 'meadow', 'nova', 'opal', 'prism',
        'quill', 'river', 'sage', 'thorn', 'umbra', 'veil', 'willow', 'xenon',
        'yarn', 'zephyr', 'amber', 'bronze', 'coral', 'dawn', 'ember', 'frost',
        'glow', 'haze', 'ivory', 'jewel', 'lake', 'mint', 'night', 'ocean',
        'pearl', 'quartz', 'ruby', 'storm', 'tide', 'violet', 'wind', 'crystal',
        'shadow', 'whisper', 'starlight', 'twilight', 'forest', 'thunder', 'dream',
        'mist', 'silver', 'golden', 'mystic', 'cosmic', 'lunar', 'stellar', 'nova'
      ];

      // Shuffle and pick 10 random words
      const shuffled = [...wordPool].sort(() => Math.random() - 0.5);
      const selectedWords = shuffled.slice(0, 10);
      

      this.gameWords = selectedWords;
      return selectedWords;
    } catch (error) {
      console.error('Error generating random words:', error);
      // Fallback to default words if generation fails
      this.gameWords = ['starlight', 'whisper', 'forest', 'shadow', 'crystal', 'ember', 'mist', 'thunder', 'dream', 'twilight'];
      return this.gameWords;
    }
  }

  // Generate riddles for the random words using AI
  async generateRiddlesForWords(words) {
    try {
      const riddles = {};
      
      // For each word, create a poetic riddle
      for (const word of words) {
        const riddlePrompts = {
          aurora: "Dancing lights in northern skies, colors that never say goodbye.",
          breeze: "I touch your face but have no hands, I move the leaves across the lands.",
          cascade: "I tumble down from heights so steep, my voice echoes loud and deep.",
          dusk: "When day retreats and night draws near, I paint the sky with colors dear.",
          echo: "I speak your words but am not you, in mountains deep, I answer true.",
          flame: "I dance and flicker, warm and bright, consuming darkness with my light.",
          grove: "A circle where the tall ones meet, their whispered secrets, soft and sweet.",
          harbor: "Where weary ships find peaceful rest, sheltered from the ocean's test.",
          iris: "In gardens bright, I catch the eye, with colors of the rainbow sky.",
          jade: "Green as forest, smooth as glass, treasured stone of ancient class.",
          kindle: "To spark a fire, to start anew, to light the way for me and you.",
          lunar: "Of silver orb that rules the night, bathing earth in gentle light.",
          meadow: "A carpet green where wild things grow, beneath the sky's expansive glow.",
          nova: "A star that blazes, bright and new, its light traveling to reach you.",
          opal: "A stone that holds the rainbow's fire, colors shifting, never tire.",
          prism: "I split the light into its parts, revealing rainbow works of art.",
          quill: "From feathered wing to writer's hand, I help ideas across the land.",
          river: "I carve through valleys, wide and long, singing water's ancient song.",
          sage: "Wisdom grows in silver-green, in gardens where I'm often seen.",
          thorn: "Sharp protection for the rose, where beauty and danger both compose.",
          umbra: "The darkest part of shadow's play, where light has fully gone away.",
          veil: "I hide what lies beneath from sight, gossamer thin, translucent light.",
          willow: "My branches weep toward the ground, by water's edge, I'm often found.",
          xenon: "A noble gas that glows so bright, in signs that pierce the dark of night.",
          yarn: "Twisted threads of wool so fine, in countless colors, I align.",
          zephyr: "A gentle wind that softly blows, bringing peace wherever it goes.",
          amber: "Ancient resin, golden bright, preserving life in crystal light.",
          bronze: "An alloy strong of copper's hue, with tin to make me bold and true.",
          coral: "In ocean depths, I build my home, a living reef beneath the foam.",
          dawn: "First light that breaks the grip of night, painting sky with colors bright.",
          ember: "The glowing heart of dying fire, warmth that never seems to tire.",
          frost: "Winter's artist, crystal white, painting windows in the night.",
          glow: "Soft light that warms but does not burn, gentle radiance in return.",
          haze: "A misty veil across the day, making distant things seem far away.",
          ivory: "White as bone, smooth as silk, prized more precious than rich milk.",
          jewel: "Precious stone that catches light, sparkling beautiful and bright.",
          lake: "Still water, mirror to the sky, where peaceful reflections lie.",
          mint: "Cool and fresh, a scent so clean, in gardens where I'm often seen.",
          night: "When darkness falls and stars appear, and dreams draw wonderfully near.",
          ocean: "Vast expanse of rolling blue, home to creatures strange and true.",
          pearl: "From humble grain to treasured sphere, formed by oyster, smooth and clear.",
          quartz: "Crystal clear or cloudy white, I focus energy and light.",
          ruby: "Red as blood, a precious stone, on royal crowns I'm often shown.",
          storm: "Thunder rolls and lightning flashes, as rain in torrents down it dashes.",
          tide: "The ocean's breath, in and out, moved by moon without a doubt.",
          violet: "Purple flower, shy and small, fairest of the flowers all.",
          wind: "Invisible force that bends the trees, carrying scents upon the breeze.",
          crystal: "Clear yet not water, hard yet not ice; it catches light and gives it back.",
          shadow: "I follow without footsteps and leave when light departs.",
          whisper: "I'm heard when voices rest; soft as leaves, close as breath.",
          starlight: "I guide travelers without a sound, a thousand fires stitched across the dark.",
          twilight: "Between two tides of sky I stand—day exhales, night inhales.",
          forest: "Countless pillars, roots below, crowns above, a hush where paths entwine.",
          thunder: "My voice breaks mountains' silence, born of a blade of light.",
          dream: "Where worlds are woven without hands, and morning is a door.",
          mist: "I hide the world in a soft veil, not rain, not cloud, yet both.",
          silver: "Metal bright like moon's own gleam, precious beyond a poet's dream.",
          golden: "Bright as sun and just as rare, treasure beyond all compare.",
          mystic: "Wrapped in mystery and lore, ancient secrets at my core.",
          cosmic: "Of the stars and space between, in the vast celestial scene.",
          stellar: "Of the stars that shine so bright, beacons in the endless night.",
          nova: "A star reborn in blazing light, outshining all throughout the night."
        };

        riddles[word] = riddlePrompts[word] || `I am ${word}, seek me well, in nature's book my secrets dwell.`;
      }


      this.gameRiddles = riddles;
      return riddles;
    } catch (error) {
      console.error('Error generating riddles:', error);
      // Return simple riddles as fallback
      const fallbackRiddles = {};
      words.forEach(word => {
        fallbackRiddles[word] = `I am ${word}, find me if you can.`;
      });
      this.gameRiddles = fallbackRiddles;
      return fallbackRiddles;
    }
  }

  // Initialize random words and riddles for a new game session
  async initializeGameWords() {
    const words = await this.generateRandomWords();
    const riddles = await this.generateRiddlesForWords(words);
    return { words, riddles };
  }

  // Note: Victory detection is now handled by AI responses with *VICTORY* markers
  // This eliminates duplicate logic between client-side checking and AI-based detection
}

export default NPCApiService;