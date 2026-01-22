/**
 * ConnectionsScreen 스타일
 * 인연 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { cardStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  infoBox: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderRadius: borderRadius.md,
  },
  infoText: {
    ...createTextStyle('sm', {
      color: colors.primary[700],
      textAlign: 'center',
    }),
  },
  listContent: {
    padding: spacing[4],
  },
  recommendationCard: {
    ...cardStyles.base(),
    marginBottom: spacing[3],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultAvatar: {
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...createTextStyle('xl', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  userDetails: {
    marginLeft: spacing[3],
    flex: 1,
  },
  userName: {
    ...createTitleStyle('lg'),
  },
  userLevel: {
    ...createSecondaryTextStyle('sm', {
      marginTop: spacing[1],
    }),
  },
  matchBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  matchText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
    }),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  rejectButtonText: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  acceptButton: {
    backgroundColor: colors.primary[500],
  },
  acceptButtonText: {
    ...createButtonTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.inverse,
    }),
  },
  chatRoomCard: {
    flexDirection: 'row',
    ...cardStyles.base(),
    marginBottom: spacing[3],
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
  },
  unreadText: {
    ...createTextStyle('xs', {
      fontSize: 10,
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatUserName: {
    ...createTitleStyle('base'),
  },
  chatTime: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  lastMessage: {
    ...createSecondaryTextStyle('sm', {
      marginTop: spacing[1],
    }),
  },
  matchedMission: {
    ...createTextStyle('xs', {
      color: colors.primary[600],
      marginTop: spacing[1],
    }),
  },
});
