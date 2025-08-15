// Use different API base URL for development vs production
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Development: use proxy
  : 'http://127.0.0.1:4315';  // Production: direct API calls

class NPCDebugService {
  constructor(npcService) {
    this.npcService = npcService;
  }

  getHeaders() {
    return this.npcService.getHeaders();
  }

  // Try different game ID strategies for Unity-to-React compatibility
  async testUnityCompatibility() {
    try {
      console.log('Testing Unity-to-React compatibility22...');

      const strategies = [
        { name: 'Use game key as game ID', gameId: this.npcService.gameKey },
        { name: 'Use game key (URL encoded)', gameId: encodeURIComponent(this.npcService.gameKey) },
        { name: 'Use game key (lowercase)', gameId: this.npcService.gameKey.toLowerCase().replace(/\s+/g, '') },
        { name: 'Use current game ID', gameId: this.npcService.gameId },
        { name: 'Use "web" as platform identifier', gameId: 'web' },
        { name: 'Use "react" as platform identifier', gameId: 'react' },
        { name: 'Use "browser" as platform identifier', gameId: 'browser' },
        { name: 'Use "default" game ID', gameId: 'default' },
      ];

      const results = {};

      for (const strategy of strategies) {
        try {
          console.log(`Testing strategy: ${strategy.name} (gameId: "${strategy.gameId}")`);

          const response = await fetch(`${API_BASE_URL}/npc/games/${strategy.gameId}/npcs/spawn`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
              character_description: 'Test NPC for React app compatibility',
              commands: [],
              name: 'Test NPC',
              short_name: 'Test',
              system_prompt: 'You are a test NPC to verify React app compatibility with Unity API.',
              voice_id: 'test',
            }),
          });

          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = 'Could not read response text';
          }

          results[strategy.name] = {
            gameId: strategy.gameId,
            status: response.status,
            statusText: response.statusText,
            success: response.status >= 200 && response.status < 300,
            response: responseText.substring(0, 300),
          };

          console.log(`${strategy.name}: ${response.status} ${response.statusText}`);
          if (response.status >= 200 && response.status < 300) {
            console.log(`✅ SUCCESS! Working game ID: "${strategy.gameId}"`);
            this.npcService.gameId = strategy.gameId;
            break;
          }
        } catch (error) {
          results[strategy.name] = {
            gameId: strategy.gameId,
            error: error.message,
          };
          console.log(`${strategy.name}: ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Unity compatibility test failed:', error);
      return { error: error.message };
    }
  }

  // Try to register our React app as a "game"
  async tryRegisterAsGame() {
    try {
      console.log('Attempting to register React app as a game...');

      const gameRegistrations = [
        {
          name: 'Register with game key',
          method: 'PUT',
          endpoint: `/npc/games/${this.npcService.gameKey}`,
          body: { name: 'React NPC Chat App', platform: 'web' },
        },
        {
          name: 'Register at games endpoint',
          method: 'POST',
          endpoint: '/npc/games',
          body: { id: this.npcService.gameKey, name: 'React NPC Chat App', platform: 'web' },
        },
        {
          name: 'Register at base games',
          method: 'POST',
          endpoint: '/games',
          body: { id: this.npcService.gameKey, name: 'React NPC Chat App', type: 'web' },
        },
      ];

      const results = {};

      for (const registration of gameRegistrations) {
        try {
          console.log(`Trying: ${registration.name}`);

          const response = await fetch(`${API_BASE_URL}${registration.endpoint}`, {
            method: registration.method,
            headers: this.getHeaders(),
            body: JSON.stringify(registration.body),
          });

          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = 'Could not read response text';
          }

          results[registration.name] = {
            method: registration.method,
            endpoint: registration.endpoint,
            status: response.status,
            statusText: response.statusText,
            response: responseText.substring(0, 200),
          };

          console.log(`${registration.name}: ${response.status} ${response.statusText}`);
        } catch (error) {
          results[registration.name] = {
            method: registration.method,
            endpoint: registration.endpoint,
            error: error.message,
          };
          console.log(`${registration.name}: ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Game registration failed:', error);
      return { error: error.message };
    }
  }

  // Try alternative NPC creation approaches
  async tryAlternativeNPCApproaches() {
    try {
      console.log('Testing alternative NPC creation approaches...');

      const npcData = {
        character_description: 'Test NPC for React app',
        commands: [],
        name: 'Test NPC',
        short_name: 'Test',
        system_prompt: 'You are a test NPC.',
        voice_id: 'test',
      };

      const approaches = [
        {
          name: 'Direct NPC spawn (no game path)',
          method: 'POST',
          endpoint: '/npc/spawn',
          body: npcData,
        },
        {
          name: 'NPC spawn with game key in body',
          method: 'POST',
          endpoint: '/npc/spawn',
          body: { ...npcData, game_id: this.npcService.gameKey },
        },
        {
          name: 'Chat completions endpoint',
          method: 'POST',
          endpoint: '/chat/completions',
          body: {
            model: 'npc',
            messages: [{ role: 'user', content: 'Hello' }],
            game_id: this.npcService.gameKey,
          },
        },
        {
          name: 'Selected characters endpoint',
          method: 'GET',
          endpoint: '/selected_characters',
        },
      ];

      const results = {};

      for (const approach of approaches) {
        try {
          console.log(`Testing: ${approach.name}`);

          const requestOptions = {
            method: approach.method,
            headers: this.getHeaders(),
          };

          if (approach.body && approach.method !== 'GET') {
            requestOptions.body = JSON.stringify(approach.body);
          }

          const response = await fetch(`${API_BASE_URL}${approach.endpoint}`, requestOptions);

          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = 'Could not read response text';
          }

          results[approach.name] = {
            method: approach.method,
            endpoint: approach.endpoint,
            status: response.status,
            statusText: response.statusText,
            success: response.status >= 200 && response.status < 300,
            response: responseText.substring(0, 300),
          };

          console.log(`${approach.name}: ${response.status} ${response.statusText}`);
        } catch (error) {
          results[approach.name] = {
            method: approach.method,
            endpoint: approach.endpoint,
            error: error.message,
          };
          console.log(`${approach.name}: ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Alternative NPC approaches test failed:', error);
      return { error: error.message };
    }
  }

  // Debug: Test basic API connectivity
  async testConnection() {
    try {
      console.log('Testing API connection...');

      const endpoints = [
        '/',
        '/health',
        '/v1',
        '/docs',
        '/npc',
        `/npc/games`,
        `/npc/games/${this.npcService.gameId}`,
        `/npc/games/${this.npcService.gameId}/npcs`,
      ];

      const results = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = 'Could not read response text';
          }

          results[endpoint] = {
            status: response.status,
            statusText: response.statusText,
            available: response.status !== 404,
            response: responseText.substring(0, 200),
          };

          console.log(`${endpoint}: ${response.status} ${response.statusText}`);
          if (responseText && responseText.length > 0) {
            console.log(`  Response: ${responseText.substring(0, 100)}...`);
          }
        } catch (error) {
          results[endpoint] = {
            status: 'ERROR',
            statusText: error.message,
            available: false,
          };
          console.log(`${endpoint}: ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Connection test failed:', error);
      return { error: error.message };
    }
  }

  // Debug: Test different game IDs
  async testGameIds() {
    try {
      console.log('Testing different game IDs...');

      const gameIds = ['Loki1212', 'default', 'test', 'game1', ''];
      const results = {};

      for (const gameId of gameIds) {
        const gameIdPath = gameId ? gameId : '[empty]';
        const endpoint = gameId ? `/npc/games/${gameId}` : '/npc/games';

        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = 'Could not read response text';
          }

          results[gameIdPath] = {
            status: response.status,
            statusText: response.statusText,
            endpoint: endpoint,
            response: responseText.substring(0, 200),
          };

          console.log(`Game ID "${gameIdPath}": ${response.status} ${response.statusText}`);
          if (responseText && responseText.length > 0) {
            console.log(`  Response: ${responseText.substring(0, 100)}...`);
          }
        } catch (error) {
          results[gameIdPath] = {
            error: error.message,
            endpoint: endpoint,
          };
          console.log(`Game ID "${gameIdPath}": ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Game ID test failed:', error);
      return { error: error.message };
    }
  }

  // Debug: Try to list games or get game info
  async debugGameEndpoints() {
    try {
      console.log('Testing game-related endpoints...');

      const gameEndpoints = [
        '/games',
        '/v1/games',
        `/games/${this.npcService.gameId}`,
        `/v1/games/${this.npcService.gameId}`,
        '/npc/games',
        `/npc/games/${this.npcService.gameId}/info`,
      ];

      const results = {};

      for (const endpoint of gameEndpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          const text = await response.text();
          results[endpoint] = {
            status: response.status,
            statusText: response.statusText,
            response: text.substring(0, 200),
          };

          console.log(`${endpoint}: ${response.status} - ${text.substring(0, 100)}`);
        } catch (error) {
          results[endpoint] = { error: error.message };
        }
      }

      return results;
    } catch (error) {
      console.error('Game endpoints test failed:', error);
      return { error: error.message };
    }
  }

  // Debug: Fetch actual Swagger documentation
  async getSwaggerDocs() {
    try {
      console.log('Fetching Swagger documentation...');

      const swaggerEndpoints = ['/docs', '/openapi.json', '/v1/openapi.json', '/swagger.json', '/api-docs'];

      const results = {};

      for (const endpoint of swaggerEndpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: { Accept: 'application/json, text/html, */*' },
          });

          const text = await response.text();
          results[endpoint] = {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            response: text,
          };

          console.log(`${endpoint}: ${response.status} - Content-Type: ${response.headers.get('content-type')}`);

          if (response.headers.get('content-type')?.includes('application/json')) {
            try {
              const json = JSON.parse(text);
              if (json.paths) {
                console.log('Available API paths:', Object.keys(json.paths));
                results[endpoint].availablePaths = Object.keys(json.paths);
              }
            } catch (parseError) {
              console.log('Could not parse JSON response');
            }
          }
        } catch (error) {
          results[endpoint] = { error: error.message };
        }
      }

      return results;
    } catch (error) {
      console.error('Swagger docs fetch failed:', error);
      return { error: error.message };
    }
  }

  // Simple connectivity test to verify Player2 API server status
  async testBasicConnectivity() {
    try {
      console.log('Testing basic connectivity to Player2 API...');

      const tests = [
        { name: 'Direct IP test', url: 'http://127.0.0.1:4315', description: 'Test direct connection to Player2 API' },
        { name: 'Direct IP /docs', url: 'http://127.0.0.1:4315/docs', description: 'Test docs endpoint directly' },
        { name: 'Direct IP /health', url: 'http://127.0.0.1:4315/health', description: 'Test health endpoint directly' },
        { name: 'Proxy test', url: `${API_BASE_URL}/docs`, description: 'Test through our proxy' },
      ];

      const results = {};

      for (const test of tests) {
        try {
          console.log(`Testing: ${test.name}`);

          const response = await fetch(test.url, {
            method: 'GET',
            headers: { Accept: 'text/html,application/json,*/*' },
          });

          results[test.name] = {
            url: test.url,
            status: response.status,
            statusText: response.statusText,
            success: response.status === 200,
            description: test.description,
          };

          console.log(`${test.name}: ${response.status} ${response.statusText}`);
        } catch (error) {
          results[test.name] = {
            url: test.url,
            error: error.message,
            description: test.description,
            success: false,
          };
          console.log(`${test.name}: ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Basic connectivity test failed:', error);
      return { error: error.message };
    }
  }

  // Test authentication and session setup
  async testAuthenticationSetup() {
    try {
      console.log('Testing authentication and session setup...');

      const authTests = [
        { name: 'Check current session', method: 'GET', endpoint: '/docs', headers: this.getHeaders(), description: 'Test if we can access docs through proxy' },
        { name: 'Try v1 OpenAPI docs', method: 'GET', endpoint: '/v1/openapi.json', headers: this.getHeaders(), description: 'Access OpenAPI spec that worked before' },
        { name: 'Test selected characters', method: 'GET', endpoint: '/selected_characters', headers: this.getHeaders(), description: 'Check if we can access character endpoint' },
        { name: 'Test TTS voices', method: 'GET', endpoint: '/tts/voices', headers: this.getHeaders(), description: 'Check TTS endpoint that should be available' },
        { name: 'Test without game key header', method: 'GET', endpoint: '/selected_characters', headers: { 'Content-Type': 'application/json' }, description: 'Test if game key header is required' },
      ];

      const results = {};

      for (const test of authTests) {
        try {
          console.log(`Testing: ${test.name}`);

          const response = await fetch(`${API_BASE_URL}${test.endpoint}`, {
            method: test.method,
            headers: test.headers,
          });

          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = 'Could not read response text';
          }

          results[test.name] = {
            method: test.method,
            endpoint: test.endpoint,
            status: response.status,
            statusText: response.statusText,
            success: response.status >= 200 && response.status < 300,
            response: responseText.substring(0, 200),
            description: test.description,
            hasGameKey: test.headers['player2-game-key'] ? 'Yes' : 'No',
          };

          console.log(`${test.name}: ${response.status} ${response.statusText}`);
          if (response.status >= 200 && response.status < 300) {
            console.log(`✅ SUCCESS: ${test.name}`);
          }
        } catch (error) {
          results[test.name] = {
            method: test.method,
            endpoint: test.endpoint,
            error: error.message,
            description: test.description,
            hasGameKey: test.headers['player2-game-key'] ? 'Yes' : 'No',
          };
          console.log(`${test.name}: ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Authentication setup test failed:', error);
      return { error: error.message };
    }
  }

  // Fetch and analyze the CURRENT OpenAPI specification
  async getCurrentAPISpec() {
    try {
      console.log('Fetching current OpenAPI specification...');

      const response = await fetch(`${API_BASE_URL}/v1/openapi.json`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
      }

      const spec = await response.json();
      console.log('OpenAPI spec fetched successfully:', spec);

      const availableEndpoints = [];
      if (spec.paths) {
        Object.entries(spec.paths).forEach(([path, methods]) => {
          Object.keys(methods).forEach((method) => {
            if (method !== 'parameters') {
              availableEndpoints.push({
                path: path,
                method: method.toUpperCase(),
                summary: methods[method].summary || 'No summary',
                operationId: methods[method].operationId || 'No operation ID',
              });
            }
          });
        });
      }

      return {
        success: true,
        spec: spec,
        availableEndpoints: availableEndpoints,
        totalEndpoints: availableEndpoints.length,
        serverInfo: spec.info || {},
        version: spec.info?.version || 'Unknown',
      };
    } catch (error) {
      console.error('Failed to get current API spec:', error);
      return { success: false, error: error.message };
    }
  }

  // Test the actual available endpoints from the current API spec
  async testCurrentEndpoints() {
    try {
      console.log('Testing actual available endpoints...');

      const specResult = await this.getCurrentAPISpec();
      if (!specResult.success) {
        throw new Error('Could not fetch API spec: ' + specResult.error);
      }

      const endpoints = specResult.availableEndpoints;
      console.log(`Found ${endpoints.length} endpoints in current API spec`);

      const endpointsToTest = endpoints
        .filter((ep) => ep.method === 'GET' && (ep.path.includes('npc') || ep.path.includes('game') || ep.path.includes('chat') || ep.path.includes('health') || ep.path.includes('character') || ep.path === '/' || ep.path.includes('selected')))
        .slice(0, 10);

      console.log(`Testing ${endpointsToTest.length} relevant endpoints`);

      const results = {
        specInfo: {
          version: specResult.version,
          totalEndpoints: specResult.totalEndpoints,
          serverInfo: specResult.serverInfo,
        },
        endpointTests: {},
      };

      for (const endpoint of endpointsToTest) {
        try {
          console.log(`Testing: ${endpoint.method} ${endpoint.path}`);

          if (endpoint.path.includes('{')) {
            results.endpointTests[`${endpoint.method} ${endpoint.path}`] = {
              status: 'SKIPPED',
              reason: 'Requires path parameters',
              summary: endpoint.summary,
            };
            continue;
          }

          const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
            method: endpoint.method,
            headers: this.getHeaders(),
          });

          let responseText = '';
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = 'Could not read response';
          }

          results.endpointTests[`${endpoint.method} ${endpoint.path}`] = {
            status: response.status,
            statusText: response.statusText,
            success: response.status >= 200 && response.status < 300,
            summary: endpoint.summary,
            response: responseText.substring(0, 150),
          };

          console.log(`${endpoint.method} ${endpoint.path}: ${response.status} ${response.statusText}`);
        } catch (error) {
          results.endpointTests[`${endpoint.method} ${endpoint.path}`] = {
            error: error.message,
            summary: endpoint.summary,
          };
          console.log(`${endpoint.method} ${endpoint.path}: ERROR - ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to test current endpoints:', error);
      return { error: error.message };
    }
  }

  // Test if endpoints need v1 prefix
  async testV1PrefixedEndpoints() {
    try {
      console.log('Testing if endpoints need /v1/ prefix...');

      const endpointsToTest = [
        { path: '/health', description: 'Health check endpoint' },
        { path: '/selected_characters', description: 'Selected characters endpoint' },
        { path: '/tts/voices', description: 'TTS voices endpoint' },
        { path: '/stt/languages', description: 'STT languages endpoint' },
        { path: '/chat/completions', description: 'Chat completions endpoint' },
      ];

      const results = { withoutPrefix: {}, withV1Prefix: {} };

      console.log('Testing without /v1/ prefix...');
      for (const endpoint of endpointsToTest) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          results.withoutPrefix[endpoint.path] = {
            status: response.status,
            statusText: response.statusText,
            success: response.status >= 200 && response.status < 300,
            description: endpoint.description,
          };

          console.log(`Without prefix ${endpoint.path}: ${response.status} ${response.statusText}`);
        } catch (error) {
          results.withoutPrefix[endpoint.path] = { error: error.message, description: endpoint.description };
        }
      }

      console.log('Testing WITH /v1/ prefix...');
      for (const endpoint of endpointsToTest) {
        try {
          const response = await fetch(`${API_BASE_URL}/v1${endpoint.path}`, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          results.withV1Prefix[endpoint.path] = {
            status: response.status,
            statusText: response.statusText,
            success: response.status >= 200 && response.status < 300,
            description: endpoint.description,
            actualPath: `/v1${endpoint.path}`,
          };

          console.log(`With /v1 prefix ${endpoint.path}: ${response.status} ${response.statusText}`);
          if (response.status >= 200 && response.status < 300) {
            console.log(`✅ SUCCESS with /v1 prefix: ${endpoint.path}`);
          }
        } catch (error) {
          results.withV1Prefix[endpoint.path] = { error: error.message, description: endpoint.description, actualPath: `/v1${endpoint.path}` };
        }
      }

      return results;
    } catch (error) {
      console.error('V1 prefix test failed:', error);
      return { error: error.message };
    }
  }

  // Test NPC endpoints with v1 prefix and real game ID
  async testV1NPCEndpoints() {
    try {
      console.log('Testing NPC endpoints with /v1/ prefix...');

      const gameIds = ['let-me-pass', 'default', 'web', 'react', 'test'];
      const results = {};

      for (const gameId of gameIds) {
        console.log(`Testing NPC endpoints with game ID: ${gameId}`);

        results[gameId] = {};

        try {
          const spawnData = {
            character_description: 'Test NPC for API validation',
            commands: [],
            name: 'Test NPC',
            short_name: 'Test',
            system_prompt: 'You are a test NPC for API validation.',
            voice_id: 'test',
          };

          const spawnResponse = await fetch(`${API_BASE_URL}/v1/npc/games/${gameId}/npcs/spawn`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(spawnData),
          });

          results[gameId].spawn = {
            status: spawnResponse.status,
            statusText: spawnResponse.statusText,
            success: spawnResponse.status >= 200 && spawnResponse.status < 300,
            path: `/v1/npc/games/${gameId}/npcs/spawn`,
          };

          console.log(`Spawn ${gameId}: ${spawnResponse.status} ${spawnResponse.statusText}`);
          if (spawnResponse.status >= 200 && spawnResponse.status < 300) {
            console.log(`✅ SUCCESS! Working game ID for spawn: ${gameId}`);
            this.npcService.gameId = gameId;
            try {
              const responseText = await spawnResponse.text();
              results[gameId].spawn.response = responseText.substring(0, 200);
            } catch (e) {}
          }
        } catch (error) {
          results[gameId].spawn = { error: error.message, path: `/v1/npc/games/${gameId}/npcs/spawn` };
        }

        try {
          const responsesResponse = await fetch(`${API_BASE_URL}/v1/npc/games/${gameId}/npcs/responses`, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          results[gameId].responses = {
            status: responsesResponse.status,
            statusText: responsesResponse.statusText,
            success: responsesResponse.status >= 200 && responsesResponse.status < 300,
            path: `/v1/npc/games/${gameId}/npcs/responses`,
          };

          console.log(`Responses ${gameId}: ${responsesResponse.status} ${responsesResponse.statusText}`);
        } catch (error) {
          results[gameId].responses = { error: error.message, path: `/v1/npc/games/${gameId}/npcs/responses` };
        }
      }

      return results;
    } catch (error) {
      console.error('V1 NPC endpoints test failed:', error);
      return { error: error.message };
    }
  }
}

export default NPCDebugService;


