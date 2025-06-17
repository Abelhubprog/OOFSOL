import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

const DynamicProvider = ({ children }: { children: React.ReactNode }) => {
  const environmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  
  // If no environment ID is provided, render children without Dynamic wrapper
  if (!environmentId) {
    console.warn('VITE_DYNAMIC_ENVIRONMENT_ID not found. Wallet features will be limited.');
    return <>{children}</>;
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
        appName: 'OOF',
        cssOverrides: `
          .dynamic-widget-card {
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
            border: 1px solid #8b5cf6;
          }
          .dynamic-widget-button {
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            color: white;
          }
          .dynamic-widget-button:hover {
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
          }
        `,
        initialAuthenticationMode: 'connect-only',
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};

export default DynamicProvider;