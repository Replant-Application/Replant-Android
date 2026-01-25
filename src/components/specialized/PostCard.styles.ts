/**
 * PostCard 스타일
 * 커뮤니티 게시글 카드 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';
import { cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    ...cardStyles.base(),
    borderWidth: 4,
    borderColor: '#0E0F37',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.white,
    }),
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  authorName: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
  },
  categoryText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  date: {
    ...createSecondaryTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  menuButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  menuIcon: {
    ...createTextStyle('xl', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    right: spacing[2],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border.light,
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  menuItemIcon: {
    ...createTextStyle('base'),
  },
  menuItemText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  deleteText: {
    color: colors.red[500],
  },
  content: {
    marginBottom: spacing[3],
  },
  missionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  missionEmoji: {
    ...createTextStyle('base'),
  },
  missionEmojiImage: {
    width: 16,
    height: 16,
  },
  missionTitle: {
    flex: 1,
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.primary[800],
    }),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
    marginLeft: spacing[2],
  },
  verifiedIcon: {
    ...createTextStyle('xs', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  verifiedText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    gap: 2,
    marginLeft: spacing[2],
  },
  pendingIcon: {
    ...createTextStyle('xs'),
  },
  pendingText: {
    ...createTextStyle('xs', {
      color: colors.orange[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  completionRateText: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
    marginLeft: spacing[2],
  },
  title: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  text: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
    }),
  },
  imageContainer: {
    marginBottom: spacing[3],
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: colors.background.secondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
    marginBottom: spacing[3],
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  tagText: {
    ...createTextStyle('xs', {
      color: colors.gray[700],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  footer: {
    paddingTop: 0,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.md,
  },
  statIcon: {
    ...createTextStyle('base'),
  },
  statIconImage: {
    width: 20,
    height: 20,
  },
  likedIcon: {
    // 이미 이모지로 표시됨
  },
  scrappedIcon: {
    // 이미 이모지로 표시됨
  },
  statText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  statTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.normal,
  },
});
