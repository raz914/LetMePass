// API check service to verify if Player2 API is running
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Development: use proxy
  : 'http://127.0.0.1:4315';  // Production: direct API calls

/**
 * Check if the Player2 API is running and accessible
 * @returns {Promise<boolean>} True if API is accessible, false otherwise
 */
export const checkApiAvailability = async () => {
  try {
    // Try to access the API health endpoint with v1 prefix
    const response = await fetch(`${API_BASE_URL}/v1/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout to avoid long waits if API is down
      signal: AbortSignal.timeout(3000),
    });
    
    // If we get any response, consider the API available
    return response.ok;
  } catch (error) {
    console.error('Player2 API check failed:', error);
    return false;
  }
};

export default {
  checkApiAvailability,
};
