/**
 * HomeScreen 스타일
 * 홈 화면의 모든 스타일 정의
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius, layout } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles, emptyStateStyles, modalStyles } from '../../utils/styles/commonStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  startChatButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  startChatButton: {
    backgroundColor: colors.overlay.white.heavy,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.brandAccent,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  startChatButtonText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
    }),
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
    top: '22%',
    left: '50%',
    transform: [{ translateX: -(SCREEN_WIDTH * 0.94) / 2 + 10 }],
    width: SCREEN_WIDTH * 0.94,
    alignSelf: 'center',
  },
  speechBubbleImage: {
    width: '100%',
    minHeight: 130,
    paddingHorizontal: spacing[2],
    paddingTop: spacing[1],
    paddingBottom: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechBubbleAnimatedContainer: {
    width: '100%',
  },
  speechTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechText: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
      letterSpacing: 0,
      textAlign: 'center',
      width: '100%',
      alignSelf: 'stretch',
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
  keyboardAvoidingView: {
    flex: 1,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl + 8,
    borderTopRightRadius: borderRadius.xl + 8,
    borderColor: colors.gray[900],
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
    paddingHorizontal: layout.globalGutter,
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
    backgroundColor: colors.overlay.white.light,
    borderRadius: borderRadius.base,
    padding: spacing[2],
    marginBottom: spacing[1],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  missionItemCompleted: {
    opacity: 0.6,
    backgroundColor: colors.gray[100],
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
    backgroundColor: colors.overlay.white.heavy,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: colors.brandAccent,
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
    ...createTextStyle('xl', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    }),
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
    ...createButtonTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
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
    backgroundColor: colors.overlay.dark,
  },
  evolutionModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  evolutionContentContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  evolutionTitle: {
    ...createTextStyle('xl', {
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      lineHeight: getOptimizedLineHeight(typography.fontSize.xl),
      textAlign: 'center',
      marginBottom: spacing[6],
    }),
  },
  evolutionImageContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionImage: {
    width: '100%',
    height: '100%',
  },
  evolutionSpeechBubble: {
    width: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  evolutionSpeechBubbleImage: {
    width: '100%',
    minHeight: 100,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  evolutionSpeechTextContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evolutionSpeechText: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      lineHeight: getOptimizedLineHeight(typography.fontSize.base),
      letterSpacing: 0,
      textAlign: 'center',
    }),
  },
});
