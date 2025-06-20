import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  EnhancedSwapTransaction,
  BirdeyeSwapTransaction,
  BirdeyeSwapResponse,
} from '../components/trade/ShareTradeModal.types';
import { BIRDEYE_API_KEY } from '@env';

/**
 * Converts a Birdeye swap transaction to our app's SwapTransaction format.
 */
const convertBirdeyeToSwapTransaction = (
  birdeyeSwap: BirdeyeSwapTransaction,
  index: number
): EnhancedSwapTransaction => {
  const inputToken = birdeyeSwap.base.type_swap === 'from' ? birdeyeSwap.base : birdeyeSwap.quote;
  const outputToken = birdeyeSwap.base.type_swap === 'to' ? birdeyeSwap.base : birdeyeSwap.quote;

  return {
    signature: birdeyeSwap.tx_hash,
    timestamp: birdeyeSwap.block_unix_time,
    inputToken: {
      mint: inputToken.address,
      symbol: inputToken.symbol,
      name: inputToken.symbol,
      decimals: inputToken.decimals,
      amount: parseInt(inputToken.amount, 10),
    },
    outputToken: {
      mint: outputToken.address,
      symbol: outputToken.symbol,
      name: outputToken.symbol,
      decimals: outputToken.decimals,
      amount: parseInt(outputToken.amount, 10),
    },
    success: true, // Birdeye only returns successful transactions
    volumeUsd: birdeyeSwap.volume_usd,
    uniqueId: `${birdeyeSwap.tx_hash}-${birdeyeSwap.ins_index}-${birdeyeSwap.inner_ins_index}-${index}`,
  };
};

/**
 * Fetches swap transactions using Birdeye API.
 */
const fetchSwapsWithBirdeyeInternal = async (
  ownerAddress: string
): Promise<EnhancedSwapTransaction[]> => {
  if (!ownerAddress) {
    throw new Error('Wallet address is required');
  }

  if (!BIRDEYE_API_KEY) {
    console.error('[usePastSwaps] Birdeye API key is missing');
    throw new Error('Birdeye API key is missing. Please check your environment variables.');
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const daysToFetch = 28;
    const startTime = now - daysToFetch * 24 * 60 * 60;


    const url = `https://public-api.birdeye.so/defi/v3/txs?offset=0&limit=50&sort_by=block_unix_time&sort_type=desc&tx_type=swap&owner=${ownerAddress}&after_time=${startTime}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-chain': 'solana',
        'x-api-key': BIRDEYE_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`[usePastSwaps] Birdeye API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error(`[usePastSwaps] Birdeye API error body: ${errorBody}`);
      throw new Error(`Birdeye API error: ${response.status} ${response.statusText}`);
    }

    const result: BirdeyeSwapResponse = await response.json();

    if (!result.data || !result.data.items) {

      return [];
    }

    return result.data.items.map((item, index) =>
      convertBirdeyeToSwapTransaction(item, index)
    );
  } catch (error) {
    console.error('[usePastSwaps] Error fetching swaps from Birdeye:', error);
    throw error;
  }
};

/**
 * Groups related swaps by timestamp (within 5 seconds).
 */
const groupRelatedSwapsInternal = (
  swaps: EnhancedSwapTransaction[]
): EnhancedSwapTransaction[] => {
  if (!swaps.length) return [];

  const sortedSwaps = [...swaps].sort((a, b) => a.timestamp - b.timestamp);
  const groupedSwaps: EnhancedSwapTransaction[] = [];
  let currentGroup: EnhancedSwapTransaction[] = [];
  const TIME_WINDOW = 5;

  sortedSwaps.forEach((swap, index) => {
    if (index === 0) {
      currentGroup = [swap];
    } else {
      const prevSwap = sortedSwaps[index - 1];
      const timeDiff = Math.abs(swap.timestamp - prevSwap.timestamp);

      if (timeDiff <= TIME_WINDOW) {
        currentGroup.push(swap);
      } else {
        if (currentGroup.length > 0) {
          if (currentGroup.length === 1) {
            groupedSwaps.push(currentGroup[0]);
          } else {
            const firstSwap = currentGroup[0];
            const lastSwap = currentGroup[currentGroup.length - 1];
            const combinedSwap: EnhancedSwapTransaction = {
              ...firstSwap,
              outputToken: lastSwap.outputToken,
              uniqueId: `${firstSwap.uniqueId}-combined`,
              isMultiHop: true,
              hopCount: currentGroup.length,
              childTransactions: currentGroup,
            };
            groupedSwaps.push(combinedSwap);
          }
        }
        currentGroup = [swap];
      }
    }
  });

  if (currentGroup.length > 0) {
    if (currentGroup.length === 1) {
      groupedSwaps.push(currentGroup[0]);
    } else {
      const firstSwap = currentGroup[0];
      const lastSwap = currentGroup[currentGroup.length - 1];
      const combinedSwap: EnhancedSwapTransaction = {
        ...firstSwap,
        outputToken: lastSwap.outputToken,
        uniqueId: `${firstSwap.uniqueId}-combined`,
        isMultiHop: true,
        hopCount: currentGroup.length,
        childTransactions: currentGroup,
      };
      groupedSwaps.push(combinedSwap);
    }
  }
  return groupedSwaps.sort((a, b) => b.timestamp - a.timestamp);
};

interface UsePastSwapsProps {
  walletAddress: string | null;
  visible: boolean; // To trigger initial fetch when modal becomes visible
}

export function usePastSwaps({ walletAddress, visible }: UsePastSwapsProps) {
  const [swaps, setSwaps] = useState<EnhancedSwapTransaction[]>([]);
  const [initialLoading, setInitialLoading] = useState(false); // Start with false, set to true when starting to load
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);
  const hasLoadedInitialDataRef = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAndProcessSwaps = useCallback(async (isForceRefresh = false) => {
    if (!isMounted.current) return;
    setApiError(null);

    if (!walletAddress) {
      setInitialLoading(false);
      setRefreshing(false);
      setApiError("Please connect your wallet to view your swap history");
      return;
    }

    if (!BIRDEYE_API_KEY) {
      setInitialLoading(false);
      setRefreshing(false);
      setApiError("API configuration error. Please contact support.");
      return;
    }

    if (isRefreshingRef.current && !isForceRefresh) {
      return;
    }

    isRefreshingRef.current = true;
    
    // Set proper loading states
    if (!hasLoadedInitialDataRef.current && !isForceRefresh) {
      setInitialLoading(true);
      setRefreshing(false);
    } else {
      setRefreshing(true);
      setInitialLoading(false);
    }

    try {
      const birdeyeSwaps = await fetchSwapsWithBirdeyeInternal(walletAddress);
      const groupedSwaps = groupRelatedSwapsInternal(birdeyeSwaps);
      if (isMounted.current) {
        setSwaps(groupedSwaps);
      }
    } catch (err: any) {
      console.error('[usePastSwaps] Error fetching past swaps:', err);
      if (isMounted.current) {
        setApiError(err.message || "Failed to fetch swap history");
        if (swaps.length === 0) {
          Alert.alert(
            "Error Loading Swaps",
            "There was a problem loading your swap history. Please try again later."
          );
        }
      }
    } finally {
      if (isMounted.current) {
        setRefreshing(false);
        setInitialLoading(false);
      }
      isRefreshingRef.current = false;
      hasLoadedInitialDataRef.current = true;
    }
  }, [walletAddress, swaps.length]);

  // Initial fetch when modal becomes visible and wallet address is available
  useEffect(() => {
    if (visible && walletAddress && !hasLoadedInitialDataRef.current) {
      fetchAndProcessSwaps();
    }
  }, [visible, walletAddress, fetchAndProcessSwaps]);

  // Reset loading state when modal becomes visible again
  useEffect(() => {
    if (visible && !hasLoadedInitialDataRef.current) {
      setInitialLoading(true);
    }
  }, [visible]);

  const refreshSwaps = useCallback(() => {
    if (!walletAddress) {
      return;
    }
    fetchAndProcessSwaps(true); // Pass true for force refresh
  }, [walletAddress, fetchAndProcessSwaps]);

  return {
    swaps,
    initialLoading,
    refreshing,
    apiError,
    refreshSwaps,
    setSwaps,
    setApiError
  };
} 