import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useReduxHooks';
import { updateProfilePic } from '../state/auth/reducer';
import { 
  getAvatarUrl, 
  generateAndStoreAvatar, 
  clearCachedAvatar,
  preloadAvatar,
  generateDiceBearAvatarUrl
} from '../services/diceBearAvatarService';

interface UseAutoAvatarOptions {
  /** Whether to automatically generate avatar for current user if they don't have one */
  autoGenerate?: boolean;
  /** Whether to preload the avatar for better UX */
  preload?: boolean;
  /** Whether to update Redux state when avatar is generated */
  updateRedux?: boolean;
}

interface UseAutoAvatarReturn {
  /** The avatar URL to use (either existing profile pic or generated DiceBear avatar) */
  avatarUrl: string | null;
  /** Whether the avatar is currently being generated/loaded */
  isLoading: boolean;
  /** Any error that occurred during avatar generation */
  error: string | null;
  /** Function to manually regenerate the avatar */
  regenerateAvatar: () => Promise<void>;
  /** Function to clear the cached avatar (useful when user uploads their own) */
  clearAvatar: () => Promise<void>;
  /** Whether the current avatar is a DiceBear generated one */
  isDiceBearAvatar: boolean;
}

/**
 * Hook for automatically managing user avatars
 * 
 * @param userId - User ID/wallet address (optional, defaults to current user)
 * @param existingProfilePic - Existing profile picture URL (optional)
 * @param options - Configuration options
 * @returns Avatar management state and functions
 */
export function useAutoAvatar(
  userId?: string,
  existingProfilePic?: string | null,
  options: UseAutoAvatarOptions = {}
): UseAutoAvatarReturn {
  const {
    autoGenerate = true,
    preload = true,
    updateRedux = true
  } = options;

  const dispatch = useAppDispatch();
  
  // Get current user data from Redux
  const currentUserId = useAppSelector(state => state.auth.address);
  const currentUserProfilePic = useAppSelector(state => state.auth.profilePicUrl);
  
  // Use provided userId or fall back to current user
  const targetUserId = userId || currentUserId;
  const targetProfilePic = existingProfilePic !== undefined ? existingProfilePic : currentUserProfilePic;
  
  // Local state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiceBearAvatar, setIsDiceBearAvatar] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Ref to track if generation is in progress to prevent multiple calls
  const isGeneratingRef = useRef(false);

  /**
   * Generate or get avatar for the user with improved error handling
   */
  const generateAvatar = useCallback(async (forceRegenerate: boolean = false) => {
    if (!targetUserId) {
      setError('No user ID provided');
      return;
    }

    if (isGeneratingRef.current) {
      console.log('[useAutoAvatar] Generation already in progress, skipping...');
      return;
    }

    isGeneratingRef.current = true;
    setIsLoading(true);
    setError(null);

    // Set up a timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      if (isGeneratingRef.current) {
        console.warn('[useAutoAvatar] Avatar generation timeout, using fallback');
        setError('Avatar generation timeout');
        isGeneratingRef.current = false;
        setIsLoading(false);
        
        // Set a simple fallback avatar
        try {
          const timeoutFallbackUrl = generateDiceBearAvatarUrl(targetUserId);
          setAvatarUrl(timeoutFallbackUrl);
          setIsDiceBearAvatar(true);
        } catch (timeoutError) {
          console.error('[useAutoAvatar] Timeout fallback failed:', timeoutError);
        }
        
        setHasInitialized(true);
      }
    }, 10000); // 10 second timeout

    try {
      let newAvatarUrl: string;
      
      try {
        // Try to get the avatar URL (which handles both existing profile pics and generation)
        newAvatarUrl = await getAvatarUrl(targetUserId, targetProfilePic);
      } catch (primaryError) {
        console.warn('[useAutoAvatar] Primary avatar generation failed, using fallback:', primaryError);
        // Fallback: Generate a simple DiceBear avatar directly
        newAvatarUrl = generateDiceBearAvatarUrl(targetUserId);
      }
      
      // Clear the timeout since we succeeded
      clearTimeout(timeoutId);
      
      // Check if this is a DiceBear avatar (contains dicebear.com)
      const isDiceBear = newAvatarUrl.includes('dicebear.com');
      setIsDiceBearAvatar(isDiceBear);
      
      setAvatarUrl(newAvatarUrl);

      // Preload the avatar if requested
      if (preload) {
        try {
          preloadAvatar(newAvatarUrl);
        } catch (preloadError) {
          console.warn('[useAutoAvatar] Avatar preload failed:', preloadError);
          // Don't fail the whole process for preload errors
        }
      }

      // Update Redux state if this is for the current user and updateRedux is enabled
      if (updateRedux && targetUserId === currentUserId && isDiceBear && !targetProfilePic) {
        dispatch(updateProfilePic(newAvatarUrl));
      }
    } catch (err: any) {
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.error('[useAutoAvatar] Error generating avatar:', err);
      setError(err.message || 'Failed to generate avatar');
      
      // Last resort fallback: generate a simple avatar URL directly
      try {
        const fallbackUrl = generateDiceBearAvatarUrl(targetUserId);
        setAvatarUrl(fallbackUrl);
        setIsDiceBearAvatar(true);
        console.log('[useAutoAvatar] Using emergency fallback avatar:', fallbackUrl);
      } catch (fallbackError) {
        console.error('[useAutoAvatar] Even fallback avatar generation failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
      isGeneratingRef.current = false;
      setHasInitialized(true);
    }
  }, [targetUserId, targetProfilePic, preload, updateRedux, currentUserId, dispatch]);

  /**
   * Manually regenerate the avatar
   */
  const regenerateAvatar = useCallback(async () => {
    if (!targetUserId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newAvatarUrl = await generateAndStoreAvatar(targetUserId, true);
      setAvatarUrl(newAvatarUrl);
      setIsDiceBearAvatar(true);
      
      if (preload) {
        try {
          preloadAvatar(newAvatarUrl);
        } catch (preloadError) {
          console.warn('[useAutoAvatar] Regenerated avatar preload failed:', preloadError);
        }
      }

      // Update Redux if this is for the current user
      if (updateRedux && targetUserId === currentUserId) {
        dispatch(updateProfilePic(newAvatarUrl));
      }
    } catch (err: any) {
      console.error('[useAutoAvatar] Error regenerating avatar:', err);
      setError(err.message || 'Failed to regenerate avatar');
      
      // Fallback for regeneration too
      try {
        const fallbackUrl = generateDiceBearAvatarUrl(targetUserId);
        setAvatarUrl(fallbackUrl);
        setIsDiceBearAvatar(true);
      } catch (fallbackError) {
        console.error('[useAutoAvatar] Regeneration fallback failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, preload, updateRedux, currentUserId, dispatch]);

  /**
   * Clear the cached avatar
   */
  const clearAvatar = useCallback(async () => {
    if (!targetUserId) return;
    
    try {
      await clearCachedAvatar(targetUserId);
      setIsDiceBearAvatar(false);
    } catch (err: any) {
      console.error('[useAutoAvatar] Error clearing avatar:', err);
    }
  }, [targetUserId]);

  // Effect to initialize avatar when component mounts or dependencies change
  useEffect(() => {
    // Reset initialization state when key dependencies change
    setHasInitialized(false);
    
    if (targetProfilePic) {
      // User has an existing profile picture
      setAvatarUrl(targetProfilePic);
      setIsDiceBearAvatar(false);
      setIsLoading(false);
      setHasInitialized(true);
    } else if (autoGenerate && targetUserId) {
      // No profile picture, need to generate one
      generateAvatar(false);
    } else {
      // No user ID or auto-generation disabled
      setAvatarUrl(null);
      setIsDiceBearAvatar(false);
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [targetUserId, targetProfilePic, autoGenerate]);

  // Additional effect to ensure we always have an avatar URL for valid users
  useEffect(() => {
    // If we have a user ID, auto-generation is enabled, no profile pic, no avatar URL, 
    // not currently loading, and we've initialized, try to generate again
    if (
      targetUserId && 
      autoGenerate && 
      !targetProfilePic && 
      !avatarUrl && 
      !isLoading && 
      hasInitialized &&
      !isGeneratingRef.current
    ) {
      console.log('[useAutoAvatar] Detected missing avatar after initialization, generating...');
      generateAvatar(false);
    }
  }, [targetUserId, autoGenerate, targetProfilePic, avatarUrl, isLoading, hasInitialized, generateAvatar]);

  return {
    avatarUrl,
    isLoading,
    error,
    regenerateAvatar,
    clearAvatar,
    isDiceBearAvatar
  };
}

/**
 * Simplified hook for just getting an avatar URL
 * 
 * @param userId - User ID/wallet address
 * @param existingProfilePic - Existing profile picture URL
 * @returns Avatar URL or null if loading
 */
export function useAvatarUrl(userId?: string, existingProfilePic?: string | null): string | null {
  const { avatarUrl } = useAutoAvatar(userId, existingProfilePic, {
    autoGenerate: true,
    preload: false,
    updateRedux: false
  });
  
  return avatarUrl;
} 