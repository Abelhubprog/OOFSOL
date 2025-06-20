import { Connection, clusterApiUrl, Cluster, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { ENDPOINTS } from '@/shared/config/constants';
import { CLUSTER, HELIUS_STAKED_URL } from '@env';
import { TransactionService } from '@/modules/wallet-providers/services/transaction/transactionService';
import { SwapCallback } from '@/modules/swap/services/tradeService';
import { TokenInfo } from '@/modules/data-module';

// Define JupiterToken interface
interface JupiterToken {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
}

// Define JupiterQuoteResponse interface 
interface JupiterQuoteResponse {
  data?: Array<{
    outAmount: string;
    [key: string]: any;
  }>;
  outAmount?: string;
  routes?: Array<{
    outAmount: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Define JupiterRouteInfo interface
interface JupiterRouteInfo {
  outAmount: string;
  [key: string]: any;
}

export interface JupiterSwapResponse {
  success: boolean;
  signature?: string;
  error?: Error | string;
  inputAmount: number;
  outputAmount: number;
}

export interface JupiterSwapCallback {
  statusCallback: (status: string) => void;
}

export interface JupiterQuoteData {
  data?: Array<{
    outAmount: string;
    [key: string]: any;
  }>;
  routePlan?: Array<any>;
  outAmount?: string;
  [key: string]: any;
}

interface JupiterSwapServerResponse {
  swapTransaction?: string;
  error?: string;
}

/**
 * JupiterService - Provides methods for interacting with Jupiter Exchange
 * 
 * This service handles Jupiter-specific operations like:
 * - Getting quotes
 * - Building swap transactions
 * - Executing swaps
 */
export class JupiterService {
  /**
   * Gets a quote from Jupiter for a given swap
   */
  static async getQuote(
    inputMint: string, 
    outputMint: string, 
    inputAmount: number
  ): Promise<JupiterQuoteData> {
    try {
      console.log('Getting Jupiter quote...');
      
      const quoteUrl = `${ENDPOINTS.jupiter.quote}?inputMint=${inputMint
        }&outputMint=${outputMint}&amount=${Math.round(
          inputAmount,
        )}&slippageBps=50&swapMode=ExactIn`;
        
      const quoteResp = await fetch(quoteUrl);
      if (!quoteResp.ok) {
        throw new Error(`Jupiter quote failed: ${quoteResp.status}`);
      }
      
      const quoteData = await quoteResp.json();
      console.log('Jupiter quote received');
      
      return quoteData;
    } catch (error) {
      console.error("Error getting Jupiter quote:", error);
      throw error;
    }
  }

  /**
   * Gets a quote for a token pair given token info objects
   */
  static async getQuoteFromTokenInfo(
    inputToken: TokenInfo,
    outputToken: TokenInfo,
    inputAmount: string
  ): Promise<JupiterQuoteData | null> {
    try {
      // Validate tokens
      if (!inputToken?.address || !outputToken?.address) {
        console.error('Invalid tokens for quote:', { inputToken, outputToken });
        return null;
      }
      
      // Convert input amount to integer with proper decimal handling
      const inputAmountNum = parseFloat(inputAmount);
      if (isNaN(inputAmountNum) || inputAmountNum <= 0) {
        console.error('Invalid input amount for quote:', inputAmount);
        return null;
      }
      
      // Calculate amount in lamports/base units
      const amountInBaseUnits = inputAmountNum * Math.pow(10, inputToken.decimals);
      console.log(`[JupiterService] getQuote: Converting ${inputAmountNum} ${inputToken.symbol} to ${amountInBaseUnits} base units`);
      
      return this.getQuote(
        inputToken.address,
        outputToken.address,
        amountInBaseUnits
      );
    } catch (error) {
      console.error('Error getting Jupiter quote:', error);
      return null;
    }
  }

  /**
   * Extracts output amount from a Jupiter quote
   */
  static getOutputAmount(quoteData: JupiterQuoteData): number {
    console.log('[JupiterService] 🔍 Extracting output amount from quote data');
    console.log('[JupiterService] 📝 Quote data structure:', JSON.stringify(quoteData, null, 2));
    
    let outLamports = 0;
    
    if (
      quoteData.data &&
      Array.isArray(quoteData.data) &&
      quoteData.data.length > 0
    ) {
      outLamports = parseFloat(quoteData.data[0].outAmount) || 0;
      console.log(`[JupiterService] 💱 Extracted from data[0].outAmount: ${outLamports}`);
    } else if (
      quoteData.routePlan &&
      Array.isArray(quoteData.routePlan) &&
      quoteData.routePlan.length > 0
    ) {
      outLamports = parseFloat(quoteData.outAmount || '0') || 0;
      console.log(`[JupiterService] 💱 Extracted from quoteData.outAmount: ${outLamports}`);
    } else if (quoteData.routes && Array.isArray(quoteData.routes) && quoteData.routes.length > 0) {
      const bestRoute = quoteData.routes[0];
      if (bestRoute.outAmount) {
        outLamports = parseFloat(bestRoute.outAmount) || 0;
        console.log(`[JupiterService] 💱 Extracted from routes[0].outAmount: ${outLamports}`);
      } else {
        console.error('[JupiterService] ⚠️ Could not find outAmount in best route');
      }
    } else {
      console.error('[JupiterService] ⚠️ Could not find output amount in quote data');
      throw new Error('No routes returned by Jupiter.');
    }
    
    console.log(`[JupiterService] 💰 Final output amount: ${outLamports}`);
    return outLamports;
  }

  /**
   * Builds a swap transaction using Jupiter API
   */
  static async buildSwapTransaction(
    quoteData: JupiterQuoteData,
    walletPublicKey: string
  ): Promise<JupiterSwapServerResponse> {
    try {
      console.log('Building swap transaction from server...');
      
      const body = {
        quoteResponse: quoteData,
        userPublicKey: walletPublicKey,
      };
      
      const swapResp = await fetch(ENDPOINTS.jupiter.swap, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const swapData = await swapResp.json() as JupiterSwapServerResponse;
      
      if (!swapResp.ok || !swapData.swapTransaction) {
        throw new Error(
          swapData.error || 'Failed to get Jupiter swapTransaction.',
        );
      }
      
      console.log('Swap transaction received from server');

      return swapData;
    } catch (error) {
      console.error("Error building swap transaction:", error);
      throw error;
    }
  }

  /**
   * Builds a swap transaction from token info objects
   */
  static async buildTransactionFromTokenInfo(
    inputToken: TokenInfo,
    outputToken: TokenInfo,
    inputAmount: string,
    walletPublicKey: PublicKey,
    connection: Connection
  ): Promise<Transaction | VersionedTransaction | null> {
    try {
      // Validate tokens
      if (!inputToken?.address || !outputToken?.address) {
        throw new Error('Invalid tokens for swap');
      }
      
      // Convert input amount to integer with proper decimal handling
      const inputAmountNum = parseFloat(inputAmount);
      if (isNaN(inputAmountNum) || inputAmountNum <= 0) {
        throw new Error('Invalid input amount');
      }
      
      // Calculate amount in base units (lamports)
      const amountInBaseUnits = inputAmountNum * Math.pow(10, inputToken.decimals);
      console.log(`[JupiterService] buildSwapTransaction: Converting ${inputAmountNum} ${inputToken.symbol} to ${amountInBaseUnits} base units`);
      
      // First get a quote
      const quoteData = await this.getQuote(
        inputToken.address,
        outputToken.address,
        amountInBaseUnits
      );
      
      // Then build the transaction
      const swapData = await this.buildSwapTransaction(
        quoteData,
        walletPublicKey.toString()
      );
      
      if (!swapData.swapTransaction) {
        throw new Error('No transaction in server response');
      }
      
      // Create a transaction from response
      const txBuffer = Buffer.from(swapData.swapTransaction, 'base64');
      
      // Try to deserialize as a VersionedTransaction first
      try {
        console.log('[JupiterService] Attempting to deserialize as VersionedTransaction');
        const versionedTx = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
        console.log('[JupiterService] Successfully deserialized as VersionedTransaction');
        return versionedTx;
      } catch (e) {
        // If VersionedTransaction fails, try as regular Transaction
        console.log('[JupiterService] Not a VersionedTransaction, trying as regular Transaction');
        const transaction = Transaction.from(new Uint8Array(txBuffer));
        
        // Ensure the fee payer is set
        transaction.feePayer = walletPublicKey;
        
        // Get a fresh blockhash for the transaction
        const { blockhash } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;
        
        console.log('[JupiterService] Successfully built Transaction with', transaction.instructions.length, 'instructions');
        return transaction;
      }
    } catch (error) {
      console.error('Error building swap transaction:', error);
      return null;
    }
  }

  /**
   * Deserializes a transaction from a buffer
   */
  static deserializeTransaction(
    txBuffer: Buffer, 
    walletPublicKey: PublicKey
  ): Transaction | VersionedTransaction {
    let transaction: Transaction | VersionedTransaction;
    
    try {
      transaction = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
      console.log('Deserialized as VersionedTransaction');
    } catch {
      transaction = Transaction.from(new Uint8Array(txBuffer));
      console.log('Deserialized as legacy Transaction');

      // Ensure feePayer is set for legacy transactions
      if (!transaction.feePayer) {
        transaction.feePayer = walletPublicKey;
        console.log('Set feePayer on legacy transaction');
      }
    }
    
    return transaction;
  }

  /**
   * Executes a token swap using Jupiter API
   */
  static async executeSwap(
    inputToken: TokenInfo,
    outputToken: TokenInfo,
    inputAmount: string,
    walletPublicKey: PublicKey,
    sendTransaction: (
      transaction: Transaction | VersionedTransaction,
      connection: Connection, 
      options?: { statusCallback?: (status: string) => void, confirmTransaction?: boolean }
    ) => Promise<string>,
    callbacks?: SwapCallback
  ): Promise<JupiterSwapResponse> {
    try {
      console.log('[JupiterService] 🚀 Starting Jupiter swap execution');
      console.log(`[JupiterService] Input: ${inputAmount} ${inputToken.symbol} -> Output: ${outputToken.symbol}`);
      
      // Status update helper
      const updateStatus = (status: string) => {
        console.log(`[JupiterService] Status: ${status}`);
        callbacks?.statusCallback?.(status);
      };
      
      // Convert to base units
      const inputLamports = this.toBaseUnits(inputAmount, inputToken.decimals);
      console.log(`[JupiterService] 💼 Input amount: ${inputAmount} ${inputToken.symbol} = ${inputLamports} lamports`);
      
      // Get RPC connection
      const rpcUrl = HELIUS_STAKED_URL || ENDPOINTS.helius || clusterApiUrl(CLUSTER as Cluster);
      console.log('Using RPC URL:', rpcUrl);
      const connection = new Connection(rpcUrl, 'confirmed');
      
      // Get quote from Jupiter
      updateStatus('Getting quote...');
      const quoteData = await this.getQuote(
        inputToken.address,
        outputToken.address,
        inputLamports
      );
      
      // Extract output amount
      const outLamports = this.getOutputAmount(quoteData);
      console.log(`[JupiterService] 📊 Output amount from quote: ${outLamports} lamports`);

      // Build swap transaction
      updateStatus('Building transaction...');
      const swapData = await this.buildSwapTransaction(
        quoteData,
        walletPublicKey.toString()
      );
      
      if (!swapData.swapTransaction) {
        throw new Error('Failed to get swap transaction');
      }
      
      // Deserialize the main swap transaction
      const txBuffer = Buffer.from(swapData.swapTransaction, 'base64');
      const transaction = this.deserializeTransaction(txBuffer, walletPublicKey);

      // Send the main transaction with status updates
      updateStatus('Please approve the swap transaction...');
      console.log('Sending swap transaction...');
      
      const signature = await sendTransaction(
        transaction,
        connection,
        {
          statusCallback: (status) => {
            console.log(`[JupiterSwap] ${status}`);
            // Filter raw errors using TransactionService
            TransactionService.filterStatusUpdate(status, (filteredStatus) => {
              callbacks?.statusCallback?.(filteredStatus);
            });
          },
          confirmTransaction: true
        }
      );
      
      console.log('Swap transaction successfully sent with signature:', signature);

      // Show success notification for the main transaction
      TransactionService.showSuccess(signature, 'swap');
      
      updateStatus(`Swap successful!`);

      // Return swap result with calculated outputs
      const response: JupiterSwapResponse = {
        success: true,
        signature,
        inputAmount: inputLamports,
        outputAmount: outLamports
      };
      
      console.log(`[JupiterService] 🔄 Returning swap response:`, JSON.stringify(response));
      return response;
    } catch (err) {
      console.error('Jupiter trade error:', err);
      
      // Show error notification
      TransactionService.showError(err as Error);
      
      return {
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
        inputAmount: 0,
        outputAmount: 0
      };
    }
  }

  /**
   * Converts a decimal amount to base units (e.g., SOL -> lamports)
   */
  static toBaseUnits(amount: string, decimals: number): number {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return val * Math.pow(10, decimals);
  }

  /**
   * Gets the token price in USD from Jupiter API
   */
  static async getTokenPrice(token: TokenInfo): Promise<number> {
    try {
      if (!token || !token.address) return 0;
      
      // Use the appropriate endpoint from ENDPOINTS config
      // Fallback to a constructed URL if price endpoint is not defined
      const baseUrl = ENDPOINTS.jupiter.quote || '';
      const priceUrl = baseUrl.replace('/quote', '/price');
      const url = `${priceUrl}?ids=${token.address}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data?.data?.[token.address]?.price || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }
  
  /**
   * Gets available tokens for swapping via Jupiter
   */
  static async getTokens(): Promise<TokenInfo[]> {
    try {
      // Use the appropriate endpoint from ENDPOINTS config
      // Fallback to a constructed URL if tokens endpoint is not defined
      const baseUrl = ENDPOINTS.jupiter.quote || '';
      const tokensUrl = baseUrl.replace('/quote', '/tokens');
      
      const response = await fetch(tokensUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.status} ${response.statusText}`);
      }
      
      const data: JupiterToken[] = await response.json();
      
      // Map to TokenInfo type, ensuring all required properties are present
      return data.map(token => ({
        address: token.address,
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI || '', // Convert undefined to empty string to satisfy type
        tags: token.tags || []
      }));
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return [];
    }
  }
} 