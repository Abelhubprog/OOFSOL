import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export function useAuth() {
  const { user, primaryWallet } = useDynamicContext();

  // For compatibility with existing components
  const authUser = user ? {
    id: user.userId || primaryWallet?.address || 'unknown',
    email: user.email || null,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    walletAddress: primaryWallet?.address || null,
    profileImageUrl: null
  } : null;

  const isAuthenticated = !!user && !!primaryWallet;

  return {
    user: authUser,
    wallet: primaryWallet,
    isLoading: false,
    isAuthenticated,
    login: () => {}, // Will be handled by Dynamic widget
    logout: () => {} // Will be handled by Dynamic widget
  };
}
