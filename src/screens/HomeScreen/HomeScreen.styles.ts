/**
 * HomeScreen 스타일
 * 홈 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, emptyStateStyles, modalStyles } from '../../utils/styles/commonStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  heroSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  speechBubble: {
    position: 'absolute',
    top: '25%',
    left: '12%',
    transform: [{ translateX: -(SCREEN_WIDTH * 0.9) / 2 }],
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
  },
  speechBubbleImage: {
    width: '100%',
    minHeight: 120,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechTextContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: spacing[12],
  },
  speechText: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      lineHeight: getOptimizedLineHeight(typography.fontSize.base),
      letterSpacing: 0,
      textAlign: 'left',
      width: '100%',
    }),
  },
  characterImageContainer: {
    width: SCREEN_WIDTH * 1,
    height: SCREEN_WIDTH * 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '80%',
    left: '40%',
    marginLeft: -(SCREEN_WIDTH * 0.8) / 2,
    marginTop: -(SCREEN_WIDTH * 0.8) / 2,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterAnimatedContainer: {
    width: '70%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
    borderColor: '#0E0F37',
    borderTopWidth: 12,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  dotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gray[300],
    opacity: 0.3,
  },
  dragHandleArea: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  dragHandleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[400],
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: 150,
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  errorText: {
    ...createBodyStyle('base', {
      color: colors.text.secondary,
      marginBottom: spacing[4],
    }),
  },
  retryButton: {
    ...buttonStyles.primary(),
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...createButtonTextStyle('sm'),
  },
  timeBasedMissions: {
    marginTop: spacing[2],
  },
  timeGroup: {
    marginBottom: spacing[3],
  },
  timeLabel: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[600],
      marginBottom: spacing[1],
    }),
  },
  missionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  missionItemCompleted: {
    opacity: 0.6,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  missionItemTitle: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      marginBottom: spacing[0.5],
    }),
  },
  missionItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  missionItemList: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
    }),
  },
  missionItemListCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
  },
  todoListSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  todoListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  todoListHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoListIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
  },
  todoListTitle: {
    ...createTitleStyle('lg'),
  },
  todoListArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  todoListCount: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[2],
    }),
  },
  emptyTodoListContainer: {
    ...emptyStateStyles.container(),
  },
  emptyTodoListText: {
    ...emptyStateStyles.text(),
    marginBottom: spacing[4],
    lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
  },
  createTodoListButton: {
    ...buttonStyles.primary(),
    minWidth: 120,
  },
  createTodoListButtonText: {
    ...createButtonTextStyle('base'),
  },
  completedTodoListContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  completedIconContainer: {
    marginBottom: spacing[3],
  },
  completedIcon: {
    fontSize: 48,
  },
  completedTitle: {
    ...createTitleStyle('xl', {
      color: colors.primary[600],
      marginBottom: spacing[2],
      textAlign: 'center',
    }),
  },
  completedMessage: {
    ...createBodyStyle('base', {
      textAlign: 'center',
      marginBottom: spacing[2],
      lineHeight: getOptimizedLineHeight(typography.fontSize.base) * 1.5,
    }),
  },
  completedSubMessage: {
    ...createSecondaryTextStyle('sm', {
      textAlign: 'center',
      lineHeight: getOptimizedLineHeight(typography.fontSize.sm) * 1.4,
    }),
  },
  evolutionModalOverlay: {
    ...modalStyles.overlay(),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  evolutionModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionImageContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  evolutionImage: {
    width: '100%',
    height: '100%',
  },
  evolutionSpeechBubble: {
    width: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
  },
  evolutionSpeechBubbleImage: {
    width: '100%',
    minHeight: 120,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionSpeechTextContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evolutionSpeechText: {
    ...createTextStyle('xl', {
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
      letterSpacing: 0,
      textAlign: 'center',
    }),
  },
});
