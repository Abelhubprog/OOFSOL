import { MoonPayConfig } from '../types';

/**
 * MoonPay service for handling API interactions
 */
function createMoonPayService(config: MoonPayConfig) {
  /**
   * Get MoonPay widget URL with configured parameters
   */
  function getWidgetUrl(walletAddress?: string) {
    const baseUrl = config.environment === 'sandbox' 
      ? 'https://buy-sandbox.moonpay.com' 
      : 'https://buy.moonpay.com';
    
    const params = new URLSearchParams({
      apiKey: config.apiKey,
      ...(walletAddress && { walletAddress }),
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Validate if the configuration is correct
   */
  function validateConfig(): boolean {
    return Boolean(config.apiKey) && 
           ['sandbox', 'production'].includes(config.environment);
  }
  
  return {
    getWidgetUrl,
    validateConfig,
  };
}

export default createMoonPayService; 