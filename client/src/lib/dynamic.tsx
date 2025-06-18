import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

const DynamicProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "7037c007-259c-4dc8-8f95-3ed01c0ab2fb",
        walletConnectors: [SolanaWalletConnectors],
        appName: 'OOF Platform',
        cssOverrides: `
          .dynamic-widget-card {
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
            border: 1px solid #8b5cf6;
          }
          .dynamic-widget-button {
            background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
            color: white;
            border-radius: 8px;
            padding: 8px 16px;
            font-weight: 500;
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