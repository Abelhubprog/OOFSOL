/**
 * MoonPay utility functions
 */

/**
 * Formats wallet address for display (shortens with ellipsis)
 */
export function formatWalletAddress(address: string | null | undefined): string {
  if (!address) return '';
  
  if (address.length <= 10) return address;
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Parses MoonPay error messages to user-friendly format
 */
export function parseErrorMessage(error: Error | unknown): string {
  if (!error) return 'Unknown error occurred';
  
  if (error instanceof Error) {
    // Handle specific MoonPay error patterns
    if (error.message.includes('network') || error.message.includes('connection')) {
      return 'Unable to connect to MoonPay. Please check your internet connection.';
    }
    
    if (error.message.includes('api key')) {
      return 'Invalid API configuration. Please contact support.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get MoonPay environment constant from environment variable
 */
export function getEnvironmentFromConfig(apiKey: string): 'sandbox' | 'production' {
  // If using a test key, force sandbox environment
  if (apiKey.startsWith('pk_test_')) {
    return 'sandbox';
  }
  
  // Production keys start with pk_live_
  if (apiKey.startsWith('pk_live_')) {
    return 'production';
  }
  
  // Default to sandbox for safety
  return 'sandbox';
} 