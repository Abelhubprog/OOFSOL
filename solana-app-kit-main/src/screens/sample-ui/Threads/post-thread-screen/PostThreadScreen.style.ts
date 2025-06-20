import {StyleSheet} from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lighterBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: COLORS.brandBlue,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.bold),
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  repliesLabel: {
    marginLeft: 16,
    marginVertical: 6,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.greyMid,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  composerContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDarkColor,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.greyMid,
    fontFamily: TYPOGRAPHY.fontFamily,
  },

  // Twitter-style row layout
  rowContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  leftCol: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.brandBlue,
  },
  verticalLineTop: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.borderDarkColor,
    marginBottom: 2,
  },
  verticalLineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderDarkColor,
    marginTop: 2,
  },
  postContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  retweetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  retweetText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.greyMid,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.medium),
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  retweetContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  originalPostContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  quoteContent: {
    marginBottom: 8,
  },
  quoteText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.greyMid,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  
  // Additional styles
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  childPostContainer: {
    marginLeft: 10,
  },
  spacerView: {
    width: 40,
  },
  composerElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  }
});
