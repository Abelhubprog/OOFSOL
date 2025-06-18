import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export function useAuth() {
  const { user, primaryWallet, isAuthenticated: dynamicAuth } = useDynamicContext();

  // For compatibility with existing components
  const authUser = primaryWallet ? {
    id: primaryWallet.address,
    email: user?.email || null,
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    walletAddress: primaryWallet.address,
    profileImageUrl: null
  } : null;

  const isAuthenticated = dynamicAuth && !!primaryWallet;

  return {
    user: authUser,
    wallet: primaryWallet,
    isLoading: false,
    isAuthenticated,
    login: () => {}, // Will be handled by Dynamic widget
    logout: () => {} // Will be handled by Dynamic widget
  };
}
