/**
 * ReantChatScreen 스타일
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // 1. 대화 종료하기 버튼 (상단)
  topButtonContainer: {
    paddingTop: Platform.OS === 'ios' ? spacing[12] : spacing[8],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  endChatButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  endChatButtonText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  // 2-3. 말풍선 + 리앤트 캐릭터 영역
  heroSection: {
    height: SCREEN_HEIGHT * 0.52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing[4],
  },
  characterImageContainer: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[8],
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  speechBubble: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[2],
    right: spacing[2],
    maxWidth: SCREEN_WIDTH - spacing[4],
    zIndex: 10,
  },
  speechBubbleImage: {
    width: '100%',
    minHeight: 70,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[5],
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechTextContainer: {
    width: '100%',
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      textAlign: 'center',
      color: colors.text.primary,
      width: '100%',
    }),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  loadingText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.secondary,
    }),
  },
  // 4. 채팅칸 (하단 바텀시트)
  chatSection: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingTop: spacing[3],
  },
  dragHandleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  dragHandleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[400],
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    flexGrow: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[4],
    minHeight: 80,
  },
  emptyText: {
    ...createSecondaryTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
    paddingHorizontal: spacing[2],
    width: '100%',
  },
  userMessageBubble: {
    maxWidth: '75%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  userMessageText: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
    paddingBottom: Platform.OS === 'ios' ? spacing[6] : spacing[3],
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    minHeight: 36,
    maxHeight: 80,
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
    }),
    marginRight: spacing[2],
  },
  sendButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
