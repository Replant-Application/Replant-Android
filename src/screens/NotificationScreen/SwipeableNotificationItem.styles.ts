/**
 * SwipeableNotificationItem 스타일
 * 스와이프 가능한 알림 아이템 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    marginBottom: spacing[3],
    overflow: 'visible',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 95,
    backgroundColor: '#FF0003',
    borderWidth: 2,
    borderColor: '#0E0F37',
    borderTopRightRadius: borderRadius.base,
    borderBottomRightRadius: borderRadius.base,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
  },
  deleteButtonIcon: {
    width: 30,
    height: 30,
  },
  notificationCard: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: '#0E0F37',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },
  cardTouchable: {
    flex: 1,
  },
  unreadCard: {
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  characterImage: {
    width: 60,
    height: 60,
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.text.primary,
    marginRight: spacing[2],
  },
  title: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      flex: 1,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  unreadTitle: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      flex: 1,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  content: {
    ...createSecondaryTextStyle('xs'),
  },
  time: {
    ...createSecondaryTextStyle('xs', {
      color: colors.text.tertiary,
      marginLeft: spacing[2],
    }),
  },
});
