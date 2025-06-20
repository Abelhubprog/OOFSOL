import { StyleSheet } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

// Renamed function, now accepts theme directly and returns only base styles
export function getThreadItemBaseStyles(
  // Remove theme parameter
) {
  return StyleSheet.create({
    threadItemContainer: {
      flex: 1,
      paddingHorizontal: 16, // Replaced theme['--thread-post-padding-horizontal']
      paddingVertical: 12, // Replaced theme['--thread-post-padding-vertical']
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderDarkColor,
    },
    threadItemReplyLine: {
      borderLeftWidth: 1,
      borderLeftColor: '#E0E0E0', // Replaced theme['--thread-reply-line-color']
      marginLeft: 12,
      paddingLeft: 12,
    },
    threadItemAvatar: {
      width: 40, // Replaced theme['--thread-avatar-size']
      height: 40, // Replaced theme['--thread-avatar-size']
      borderRadius: 20, // Replaced theme['--thread-avatar-size'] / 2
      marginRight: 8,
    },
    replyingContainer: {
      backgroundColor: '#F9F9F9', // Replaced theme['--thread-replying-bg']
      padding: 8, // Replaced theme['--thread-replying-padding']
      marginVertical: 8, // Replaced theme['--thread-replying-margin-vertical']
      borderRadius: 6, // Replaced theme['--thread-replying-border-radius']
    },
    replyingText: {
      fontSize: 13,
      color: '#666',
    },
    replyingHandle: {
      color: '#2B8EF0', // Replaced theme['--thread-link-color']
      fontWeight: '600',
    },
    // Merging logic is removed here
  });
}

// Styles previously defined inline in ThreadItem.tsx (remain unchanged)
export const retweetStyles = StyleSheet.create({
  retweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 6,
    paddingTop: 4,
  },
  retweetHeaderText: {
    fontSize: 13,
    color: COLORS.greyMid,
    marginLeft: 6,
    fontWeight: '500',
  },
  retweetedContent: {
    marginTop: 4,
    width: '100%',
  },
  originalPostContainer: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.lighterBackground,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  quoteContent: {
    marginBottom: 4,
  },
  quoteText: {
    fontSize: 13,
    color: COLORS.greyMid,
  },
}); 