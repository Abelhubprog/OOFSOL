# MoonPay Module

This module integrates MoonPay services into the application, allowing users to easily purchase cryptocurrency (on-ramp) using various payment methods. It primarily utilizes the `@moonpay/react-native-moonpay-sdk` for embedding the MoonPay widget directly within the app.

## Core Functionalities

- **Crypto On-Ramp**: Provides a UI for users to buy cryptocurrencies via MoonPay.
- **Wallet Integration**: Automatically uses the connected wallet address for transactions.
- ** Customizable Widget**: The MoonPay widget can be configured for different environments (sandbox/production) and appearance.

## Module Structure

```
src/modules/moonpay/
├── components/
│   └── MoonPayWidget/        # Component that wraps the MoonPay SDK's WebView.
│       ├── index.tsx         # Logic for the MoonPay widget, including loading and error states.
│       └── styles.ts         # Styles for the widget component.
├── screens/
│   ├── OnrampScreen/         # Screen that hosts the MoonPay widget and provides additional info.
│   │   ├── index.tsx         # Main logic for the on-ramp screen.
│   │   └── styles.ts         # Styles for the on-ramp screen.
│   └── WalletScreen.tsx      # A screen displaying wallet balance and providing an entry point to the on-ramp flow.
│   └── WalletScreen.style.ts # Styles for the WalletScreen.
├── services/
│   └── moonpayService.ts     # Service utility to create MoonPay configuration and widget URLs (though primarily SDK-driven now).
├── types/
│   └── index.ts              # TypeScript type definitions (MoonPayWidgetProps, MoonPayConfig).
├── utils/
│   └── moonpayUtils.ts       # Utility functions for formatting and error parsing.
└── index.ts                  # Main barrel file for exporting module components and services.
└── README.md                 # This file.
```

## Key Components

- **`MoonPayWidget` (`components/MoonPayWidget/index.tsx`)**: 
    - This is the core UI component that embeds the MoonPay WebView using `@moonpay/react-native-moonpay-sdk`.
    - It handles loading states, error display, and retry mechanisms.
    - Props: `apiKey`, `environment`, `onOpen`, `onError`, `height`, `onRetry`.

- **`OnrampScreen` (`screens/OnrampScreen/index.tsx`)**: 
    - This screen presents the `MoonPayWidget` to the user.
    - It includes an `AppHeader` for navigation and displays informational content about using MoonPay, including the destination wallet address.
    - It uses the `useWallet` hook to get the current user's wallet address.

- **`WalletScreen` (`screens/WalletScreen.tsx`)**: 
    - Displays the user's SOL balance and wallet address.
    - Provides a button/entry point to navigate to the `OnrampScreen` for adding funds.
    - Includes features like copying the wallet address and refreshing the balance.

## Services (`services/moonpayService.ts`)

- **`createMoonPayService(config: MoonPayConfig)`**: 
    - A factory function that was likely intended for more complex interactions or direct API calls with MoonPay.
    - Currently, its main utility `getWidgetUrl` might be less relevant as the SDK handles URL construction internally.
    - `validateConfig()` helps ensure API key and environment are set.
    - The primary interaction with MoonPay is now managed by the `@moonpay/react-native-moonpay-sdk` within the `MoonPayWidget` component.

## Utilities (`utils/moonpayUtils.ts`)

- **`formatWalletAddress(address)`**: Shortens a wallet address for display (e.g., `xxxx...xxxx`).
- **`parseErrorMessage(error)`**: Converts raw error objects into more user-friendly messages.
- **`getEnvironmentFromConfig(apiKey)`**: Determines if the API key is for sandbox or production, defaulting to sandbox for safety.

## Types (`types/index.ts`)

- **`MoonPayWidgetProps`**: Defines the props accepted by the `MoonPayWidget` component.
- **`MoonPayConfig`**: Defines the configuration structure for the `moonpayService`.

## Usage Example

The typical flow is initiated from the `WalletScreen`:

1.  User is on the `WalletScreen` and sees their current balance.
2.  User taps an "Add Funds" or similar button.
3.  This action navigates them to the `OnrampScreen`.
4.  `OnrampScreen` mounts and initializes `MoonPayWidget`.
5.  `MoonPayWidget` uses the `@moonpay/react-native-moonpay-sdk` to load the MoonPay purchase flow in a WebView.
    - The `MOONPAY_API_KEY` environment variable is used.
    - The connected `wallet.address` is passed to prefill the destination.
6.  User interacts with the MoonPay interface to purchase cryptocurrency.
7.  Any errors or events from the widget can be handled via callbacks (`onOpen`, `onError`).

```typescript
// Example: Navigating to OnrampScreen from another part of the app
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/shared/navigation/RootNavigator'; // Your app's root stack param list

function MyProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleAddFunds = () => {
    navigation.navigate('OnrampScreen'); // Assuming 'OnrampScreen' is a route in your RootStackParamList
  };

  return (
    <View>
      <Button title="Add Funds via MoonPay" onPress={handleAddFunds} />
    </View>
  );
}
```

## Environment Variables

- **`MOONPAY_API_KEY`**: Your MoonPay API key (e.g., `pk_test_xxxx` or `pk_live_xxxx`). This is crucial for the widget to function.

Make sure this variable is available in your environment (e.g., via a `.env` file). 