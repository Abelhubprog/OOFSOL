# AutoAvatar Component

The `AutoAvatar` component automatically generates and manages DiceBear avatars for users who don't have profile images. This ensures that every user has a consistent, unique avatar even if they haven't uploaded their own profile picture.

## Features

- **Automatic Avatar Generation**: Uses DiceBear API to generate unique avatars based on user ID
- **IPFS Support**: Fully compatible with existing IPFSAwareImage logic for cross-platform support
- **Caching**: Caches generated avatars locally and in the database for consistency
- **Fallback Support**: Shows initials as a fallback while avatars are loading
- **Cross-Platform**: Works seamlessly on both iOS and Android

## Usage

### Basic Usage

```tsx
import {AutoAvatar} from '@/shared/components/AutoAvatar';

<AutoAvatar
  userId="user123"
  profilePicUrl={user.profilePicUrl}
  username={user.username}
  size={40}
  autoGenerate={true}
/>;
```

### Advanced Usage

```tsx
<AutoAvatar
  userId={user.id}
  profilePicUrl={user.profilePicUrl}
  username={user.username}
  size={60}
  style={customStyles.avatar}
  showInitials={true}
  autoGenerate={true}
  onLoad={() => console.log('Avatar loaded')}
  onError={() => console.log('Avatar failed to load')}
/>
```

## Props

| Prop            | Type             | Default | Description                                                 |
| --------------- | ---------------- | ------- | ----------------------------------------------------------- |
| `userId`        | `string`         | -       | User ID/wallet address (used as seed for avatar generation) |
| `profilePicUrl` | `string \| null` | -       | Existing profile picture URL                                |
| `username`      | `string`         | -       | Username for generating initials fallback                   |
| `size`          | `number`         | `40`    | Avatar size in pixels                                       |
| `style`         | `ViewStyle`      | -       | Custom style for the avatar container                       |
| `imageStyle`    | `ViewStyle`      | -       | Custom style for the avatar image                           |
| `showInitials`  | `boolean`        | `true`  | Whether to show initials as fallback                        |
| `autoGenerate`  | `boolean`        | `true`  | Whether to automatically generate DiceBear avatar           |
| `onLoad`        | `() => void`     | -       | Callback when avatar loads successfully                     |
| `onError`       | `() => void`     | -       | Callback when avatar fails to load                          |

## How It Works

1. **Priority Check**: If user has an existing profile picture, it uses that
2. **Cache Check**: Checks local cache for previously generated avatar
3. **Generation**: If no avatar exists, generates a new DiceBear avatar using the user ID as seed
4. **Storage**: Stores the generated avatar URL locally and attempts to save to database
5. **Display**: Shows the avatar with IPFS-aware image handling

## DiceBear Integration

The system uses the DiceBear API (https://api.dicebear.com) to generate avatars:

- **API Endpoint**: `https://api.dicebear.com/9.x/{style}/png`
- **Styles**: Randomly selects from 20+ available avatar styles
- **Seed**: Uses user ID/wallet address to ensure consistent avatars
- **Format**: PNG format for better React Native compatibility
- **Size**: 256x256 pixels for high quality

## Services

### DiceBear Avatar Service

Located at `src/shared/services/diceBearAvatarService.ts`, this service handles:

- Avatar URL generation
- Local caching with AsyncStorage
- Database updates (non-blocking)
- Cache management

### Auto Avatar Hook

Located at `src/shared/hooks/useAutoAvatar.ts`, this hook provides:

- Automatic avatar management
- Loading states
- Error handling
- Redux integration
- Cache clearing utilities

## Integration

The AutoAvatar component has been integrated into:

- **PostHeader**: User avatars in thread posts
- **ThreadComposer**: Current user avatar in composer
- **ChatListScreen**: User avatars in chat list
- **SearchScreen**: User avatars in search results
- **UserProfileInfo**: Profile page avatars

## Caching Strategy

1. **Local Cache**: Uses AsyncStorage with key prefix `dicebear_avatar_`
2. **Database Cache**: Attempts to store in user profile (non-blocking)
3. **Cache Invalidation**: Clears cache when user uploads their own image
4. **Preloading**: Optionally preloads avatars for better UX

## Error Handling

- Falls back to initials if avatar generation fails
- Gracefully handles network errors
- Non-blocking database operations
- Logs errors for debugging

## Performance

- Generates avatars only when needed
- Caches results to avoid repeated API calls
- Uses React Native's Image.prefetch for preloading
- Memoized components to prevent unnecessary re-renders
