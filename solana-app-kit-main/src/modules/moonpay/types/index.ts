/**
 * MoonPay module type definitions
 */

/**
 * MoonPay widget props interface
 */
export interface MoonPayWidgetProps {
  /**
   * MoonPay API key
   */
  apiKey: string;
  
  /**
   * Environment to use for MoonPay
   */
  environment?: 'sandbox' | 'production';
  
  /**
   * Called when widget is opened
   */
  onOpen?: () => void;
  
  /**
   * Called when widget encounters an error
   */
  onError?: (error: Error) => void;
  
  /**
   * Container height
   */
  height?: number;
  
  /**
   * Retry callback
   */
  onRetry?: () => void;
}

/**
 * MoonPay service configuration interface
 */
export interface MoonPayConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
} 