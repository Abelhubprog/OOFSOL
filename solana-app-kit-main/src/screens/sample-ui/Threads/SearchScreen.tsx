import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabView, SceneMap, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import SearchIcon from '../../../assets/svgs/SearchIcon';
import CloseIcon from '../../../assets/svgs/CloseIcon';
import { SERVER_URL, BIRDEYE_API_KEY } from '@env';
import TokenDetailsSheet from '../../../core/shared-ui/TrendingTokenDetails/TokenDetailsSheet';
import { RiskLevel } from '../../../shared/services/rugCheckService';
import { RootStackParamList } from '@/shared/navigation/RootNavigator';
import { AutoAvatar } from '@/shared/components/AutoAvatar';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '../../../assets/typography';

const { width } = Dimensions.get('window');

type User = {
  id: string;
  username: string;
  profile_picture_url: string | null;
};

type Token = {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  price: number;
  priceChange24h?: number;
  rank?: number;
};

// Define the route type
type RouteType = {
  key: string;
  title: string;
};

interface SearchScreenProps {
  showHeader?: boolean;
}

export default function SearchScreen({ showHeader = true }: SearchScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Tabs state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'profiles', title: 'Profiles' },
    { key: 'tokens', title: 'Tokens' },
  ]);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Tokens state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Selected token state
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isTokenDetailsVisible, setIsTokenDetailsVisible] = useState(false);

  // Get the status bar height for Android
  const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  // Fade in animation on component mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Fetch users and tokens on component mount
  useEffect(() => {
    fetchUsers();
    fetchTrendingTokens();
  }, []);

  // Filter users and tokens when search query changes
  useEffect(() => {
    // Filter users
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }

    // Filter tokens
    if (searchQuery.trim() === '') {
      setFilteredTokens(tokens);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = tokens.filter(token =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
      );
      setFilteredTokens(filtered);
    }
  }, [searchQuery, users, tokens]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log('Fetching users from:', `${SERVER_URL}/api/profile/search`);
      const response = await fetch(`${SERVER_URL}/api/profile/search`);

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      console.log('Fetched user data:', data);

      if (data.success && data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTrendingTokens = async () => {
    setLoadingTokens(true);
    try {
      // Using BirdEye API to get trending tokens with proper params and API key
      const response = await fetch(
        'https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=20',
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': BIRDEYE_API_KEY
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch trending tokens');

      const data = await response.json();
      console.log('Fetched token data:', data);

      if (data.success && data.data?.tokens) {
        // Map directly to the Token type without risk fields
        const formattedTokens: Token[] = data.data.tokens.map((token: any) => ({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          logoURI: token.logoURI,
          price: token.price,
          priceChange24h: token.price24hChangePercent,
          rank: token.rank,
        }));

        // Set the initial token list first to show content quickly
        setTokens(formattedTokens);
        setFilteredTokens(formattedTokens);
      } else {
        console.error('Invalid token response format:', data);
      }
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('OtherProfile', { userId: user.id });
  };

  // Token item press handler - opens the token details sheet
  const handleTokenPress = (token: Token) => {
    setSelectedToken(token);
    setIsTokenDetailsVisible(true);
  };

  // Memoized UserItem component to prevent re-renders
  const UserItem = React.memo(({ item, onPress }: { item: User; onPress: (user: User) => void }) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <AutoAvatar
          userId={item.id}
          profilePicUrl={item.profile_picture_url}
          username={item.username}
          size={50}
          style={styles.avatar}
          showInitials={true}
          autoGenerate={true}
          showShimmer={true}
          showLoading={false}
          onError={() => {
            console.warn('[SearchScreen] Avatar load error for user:', item.id);
          }}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userId}>@{item.id.substring(0, 6)}...{item.id.substring(item.id.length - 4)}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  });

  UserItem.displayName = 'UserItem';

  const renderUserItem = useCallback(({ item }: { item: User }) => {
    return <UserItem item={item} onPress={handleUserPress} />;
  }, [handleUserPress]);

  // Memoized key extractor for better performance
  const keyExtractor = useCallback((item: User) => item.id, []);

  // Memoized filtered users to prevent unnecessary re-calculations
  const memoizedFilteredUsers = useMemo(() => filteredUsers, [filteredUsers]);

  // TOKEN TAB COMPONENTS
  const renderTokenItem = ({ item }: { item: Token }) => {
    const priceChangeColor =
      !item.priceChange24h ? COLORS.greyMid :
        item.priceChange24h >= 0 ? '#4CAF50' : COLORS.errorRed;

    const formattedPrice = item.price < 0.01
      ? item.price.toFixed(8)
      : item.price.toFixed(2);

    const formattedPriceChange = item.priceChange24h
      ? `${item.priceChange24h >= 0 ? '+' : ''}${item.priceChange24h.toFixed(2)}%`
      : 'N/A';

    // Get rank display (medal or number)
    const getRankDisplay = (rank: number) => {
      switch (rank) {
        case 1:
          return <Text style={styles.medalEmoji}>🥇</Text>;
        case 2:
          return <Text style={styles.medalEmoji}>🥈</Text>;
        case 3:
          return <Text style={styles.medalEmoji}>🥉</Text>;
        default:
          return <Text style={styles.rankNumber}>{rank}</Text>;
      }
    };

    return (
      <TouchableOpacity
        style={styles.tokenItem}
        onPress={() => handleTokenPress(item)}
        activeOpacity={0.7}
      >
        {/* Rank Display */}
        <View style={styles.rankContainer}>
          {getRankDisplay(item.rank || 0)}
        </View>

        {/* Token Logo */}
        <View style={styles.tokenLogoContainer}>
          {item.logoURI ? (
            <Image
              source={{ uri: item.logoURI }}
              style={styles.tokenLogo}
              defaultSource={require('../../../assets/images/SENDlogo.png')}
            />
          ) : (
            <View style={styles.tokenLogoPlaceholder}>
              <Text style={styles.tokenLogoText}>
                {item.symbol[0] || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Token Info */}
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenSymbol}>{item.symbol}</Text>
          <Text style={styles.tokenName} numberOfLines={1}>{item.name}</Text>
        </View>

        {/* Token Price Info */}
        <View style={styles.tokenPriceContainer}>
          <Text style={styles.tokenPrice}>${formattedPrice}</Text>
          <Text style={[styles.tokenPriceChange, { color: priceChangeColor }]}>
            {formattedPriceChange}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // TAB SCENES
  const ProfilesTab = () => (
    <View style={styles.tabContent}>
      {loadingUsers ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.brandPrimary} style={styles.loader} />
          <Text style={styles.loaderText}>Searching for users...</Text>
        </View>
      ) : (
        <FlatList
          data={memoizedFilteredUsers}
          renderItem={renderUserItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 ? 'No users found matching your search' : 'No users available'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery.length > 0 ? 'Try different keywords' : 'Check back later'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );

  const TokensTab = () => (
    <View style={styles.tabContent}>
      {loadingTokens ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.brandPrimary} style={styles.loader} />
          <Text style={styles.loaderText}>Loading trending tokens...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTokens}
          renderItem={renderTokenItem}
          keyExtractor={item => item.address}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 ? 'No tokens found matching your search' : 'No trending tokens available'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery.length > 0 ? 'Try different keywords' : 'Check back later'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );

  const renderScene = SceneMap({
    profiles: ProfilesTab,
    tokens: TokensTab,
  });

  // Custom tab bar component
  const CustomTabBar = () => {
    return (
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={[styles.tab, index === 0 && styles.activeTab]}
          onPress={() => setIndex(0)}
        >
          <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>
            Profiles
          </Text>
          {index === 0 && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, index === 1 && styles.activeTab]}
          onPress={() => setIndex(1)}
        >
          <Text style={[styles.tabText, index === 1 && styles.activeTabText]}>
            Tokens
          </Text>
          {index === 1 && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {Platform.OS === 'android' && <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: COLORS.background }} />}
      <SafeAreaView style={[
        styles.safeArea,
        Platform.OS === 'android' && androidStyles.safeArea
      ]}>
        <Animated.View style={[{ opacity: fadeAnim }, { flex: 1 }]}>
          {showHeader && (
            <View style={[
              styles.header,
              Platform.OS === 'android' && androidStyles.header
            ]}>
              <Text style={styles.headerTitle}>Search</Text>
            </View>
          )}

          <View style={[
            styles.searchContainer,
            Platform.OS === 'android' && androidStyles.searchContainer
          ]}>
            <View style={styles.searchIcon}>
              <SearchIcon size={20} color={COLORS.greyMid} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={index === 0 ? "Search by username..." : "Search tokens..."}
              placeholderTextColor={COLORS.greyDark}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <CloseIcon size={18} color={COLORS.greyMid} />
              </TouchableOpacity>
            )}
          </View>

          <CustomTabBar />

          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width }}
            swipeEnabled={true}
            renderTabBar={() => null}
            lazy
          />

          {selectedToken && (
            <TokenDetailsSheet
              visible={isTokenDetailsVisible}
              onClose={() => setIsTokenDetailsVisible(false)}
              token={selectedToken}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: String(TYPOGRAPHY.bold) as any,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
    backgroundColor: COLORS.background,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.medium) as any,
    color: COLORS.greyDark,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: String(TYPOGRAPHY.semiBold) as any,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '35%',
    backgroundColor: COLORS.brandPrimary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: 10,
  },
  loaderText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.greyMid,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  // User Item Styles
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.lighterBackground,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.darkerBackground,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.semiBold) as any,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  userId: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.accessoryDarkColor,
    marginTop: 2,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  arrowContainer: {
    padding: 8,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.greyMid,
    fontWeight: '300',
  },
  // Token Item Styles
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.lighterBackground,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  tokenLogoContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkerBackground,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  tokenLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  tokenLogoPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.darkerBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenLogoText: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: String(TYPOGRAPHY.bold) as any,
    color: COLORS.greyMid,
  },
  tokenInfo: {
    marginLeft: 16,
    flex: 1,
  },
  tokenSymbol: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.semiBold) as any,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  tokenName: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.accessoryDarkColor,
    marginTop: 2,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  tokenPriceContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  tokenPrice: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.semiBold) as any,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  tokenPriceChange: {
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: 2,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.semiBold) as any,
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.greyMid,
    textAlign: 'center',
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  medalEmoji: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.semiBold) as any,
    color: COLORS.accessoryDarkColor,
  },
});

// Enhanced Android-specific styles
const androidStyles = StyleSheet.create({
  safeArea: {
    paddingTop: 0,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 15,
  },
  searchContainer: {
    marginTop: -24, // Reduce space between header and search bar on Android
  },
  // Add any other Android-specific style overrides here
});

