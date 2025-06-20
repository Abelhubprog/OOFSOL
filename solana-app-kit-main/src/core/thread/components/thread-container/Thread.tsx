import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThreadComposer } from '../thread-composer/ThreadComposer';
import { getThreadBaseStyles, headerStyles, tabStyles } from './Thread.styles';
import { mergeStyles } from '../../utils';
import Icons from '../../../../assets/svgs';
import { ThreadProps } from '../../types';
import { ThreadItem } from '../thread-item/ThreadItem';
import { IPFSAwareImage, getValidImageSource } from '@/shared/utils/IPFSImage';
import { useAppSelector } from '@/shared/hooks/useReduxHooks';
import { DEFAULT_IMAGES } from '@/shared/config/constants';
import { Platform } from 'react-native';
import SearchScreen from '@/screens/sample-ui/Threads/SearchScreen';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

export const Thread: React.FC<ThreadProps> = ({
  rootPosts,
  currentUser,
  showHeader = true,
  onPostCreated,
  hideComposer = false,
  onPressPost,
  ctaButtons,
  themeOverrides,
  styleOverrides,
  userStyleSheet,
  refreshing: externalRefreshing,
  onRefresh: externalOnRefresh,
  onPressUser,
  disableReplies = false,
}) => {
  // Local fallback for refreshing if not provided
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'search'>('feed');
  const navigation = useNavigation();

  // Get the stored profile pic from Redux
  const storedProfilePic = useAppSelector(state => state.auth.profilePicUrl);

  // 1. Get the base styles for this component (doesn't need theme argument anymore)
  const baseComponentStyles = getThreadBaseStyles(); 

  // 2. Use the utility function to merge base styles, overrides, and user sheet
  const styles = mergeStyles(baseComponentStyles, styleOverrides, userStyleSheet);

  // Local onRefresh if external prop is not provided
  const localOnRefresh = () => {
    setLocalRefreshing(true);
    setTimeout(() => {
      setLocalRefreshing(false);
    }, 800);
  };

  const finalRefreshing =
    externalRefreshing !== undefined ? externalRefreshing : localRefreshing;
  const finalOnRefresh =
    externalOnRefresh !== undefined ? externalOnRefresh : localOnRefresh;

  const handleProfilePress = () => {
    navigation.navigate('ProfileScreen' as never);
  };
  
  // Handler for wallet icon press
  const handleWalletPress = () => {
    navigation.navigate('WalletScreen' as never);
  };

  const renderItem = ({ item }: { item: any }) => (
    <ThreadItem
      post={item}
      currentUser={currentUser}
      rootPosts={rootPosts}
      themeOverrides={themeOverrides}
      styleOverrides={styleOverrides}
      userStyleSheet={userStyleSheet}
      onPressPost={onPressPost}
      ctaButtons={ctaButtons}
      onPressUser={onPressUser}
      disableReplies={disableReplies}
    />
  );

  return (
    <View style={styles.threadRootContainer}>
      {showHeader && (
        <View style={[styles.header, { padding: 16 }]}>
          <View style={headerStyles.container}>
            {/* Left: User Profile Image */}
            <TouchableOpacity onPress={handleProfilePress} style={headerStyles.profileContainer}>
              <IPFSAwareImage
                source={
                  storedProfilePic
                    ? getValidImageSource(storedProfilePic)
                    : currentUser && 'avatar' in currentUser && currentUser.avatar
                      ? getValidImageSource(currentUser.avatar)
                      : DEFAULT_IMAGES.user
                }
                style={headerStyles.profileImage}
                defaultSource={DEFAULT_IMAGES.user}
                key={Platform.OS === 'android' ? `profile-${Date.now()}` : 'profile'}
              />
            </TouchableOpacity>

            {/* Right: Copy and Wallet Icons */}
            <View style={headerStyles.iconsContainer}>
              <TouchableOpacity 
                style={headerStyles.iconButton}
                onPress={handleWalletPress}
                activeOpacity={0.7}
              >
                <Icons.walletIcon width={35} height={35} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Center: App Logo - Using absolute positioning to keep centered */}
            <View style={headerStyles.absoluteLogoContainer}>
              <Icons.AppLogo width={40} height={40} />
            </View>
          </View>
        </View>
      )}

      {/* Tab Slider */}
      <View style={tabStyles.container}>
        <TouchableOpacity
          style={[tabStyles.tab, activeTab === 'feed' && tabStyles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[tabStyles.tabText, activeTab === 'feed' && tabStyles.activeTabText]}>
            For You
          </Text>
          {activeTab === 'feed' && <View style={tabStyles.indicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[tabStyles.tab, activeTab === 'search' && tabStyles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Icons.searchIcon
            width={24}
            height={24}
            color={activeTab === 'search' ? COLORS.brandBlue : COLORS.greyMid}
          />
          {activeTab === 'search' && <View style={tabStyles.indicator} />}
        </TouchableOpacity>
        
        {/* Bottom gradient border */}
        <LinearGradient
          colors={['transparent', COLORS.lightBackground]}
          style={tabStyles.bottomGradient}
        />
      </View>

      {activeTab === 'feed' ? (
        <>
          {!hideComposer && (
            <ThreadComposer
              currentUser={currentUser}
              onPostCreated={onPostCreated}
              themeOverrides={themeOverrides}
              styleOverrides={styleOverrides}
            />
          )}

          <FlatList
            data={rootPosts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.threadListContainer}
            refreshing={finalRefreshing}
            onRefresh={finalOnRefresh}
          />
        </>
      ) : (
        <SearchScreen showHeader={false} />
      )}
    </View>
  );
}

// Also export as default for backward compatibility
export default Thread;
