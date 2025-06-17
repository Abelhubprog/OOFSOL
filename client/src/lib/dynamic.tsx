import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

const DynamicProvider = ({ children }: { children: React.ReactNode }) => {
  const environmentId = "0a73d89a-ab65-4323-b27c-9173ae561989";

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [SolanaWalletConnectors],
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