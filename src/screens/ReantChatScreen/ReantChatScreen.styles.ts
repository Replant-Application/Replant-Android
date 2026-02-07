/**
 * ReantChatScreen 스타일
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 연한 연두색 배경 (primary 50: 아주 연한 녹색)
const CHAT_BACKGROUND = colors.primary[50];

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: CHAT_BACKGROUND,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  // 채팅 헤더: 뒤로가기 + 캐릭터 이름
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    paddingTop: Platform.OS === 'ios' ? 50 : spacing[4],
    backgroundColor: 'transparent',
  },
  chatHeaderBack: {
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderBackIcon: {
    width: 24,
    height: 24,
  },
  chatHeaderTitle: {
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
    }),
  },
  chatHeaderRight: {
    width: 44,
    height: 44,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: 200,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: spacing[4],
  },
  dateSeparatorBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.white,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  dateSeparatorIcon: {
    fontSize: 14,
  },
  dateSeparatorText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: spacing[2],
  },
  userMessageColumn: {
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    maxWidth: SCREEN_WIDTH * 0.75,
  },
  userBubbleText: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  userMessageTime: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
    }),
    marginTop: spacing[1],
  },
  assistantMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  assistantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: spacing[2],
  },
  assistantAvatarImage: {
    width: '100%',
    height: '100%',
  },
  assistantBubbles: {
    maxWidth: SCREEN_WIDTH * 0.75,
  },
  assistantName: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
    }),
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignSelf: 'flex-start',
  },
  assistantBubbleText: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  assistantTime: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      marginTop: spacing[1],
    }),
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignSelf: 'flex-start',
  },
  loadingText: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  // 추천 메시지 칩 (입력창 위) - 가로 배치
  recommendedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  recommendedChip: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedChipText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  // 4. 하단 입력창 - 앱 톤 + 키보드 반응형 (박스 그림자 없음)
  inputContainer: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  errorText: {
    ...createSecondaryTextStyle('xs', {
      color: colors.error[500],
    }),
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    minHeight: 38,
    maxHeight: 88,
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
    borderWidth: 0,
  },
  voiceButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.white,
    borderColor: colors.primary[500],
  },
  voiceButtonIcon: {
    width: 20,
    height: 20,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  // 녹음 중 모달
  recordingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[8],
    alignItems: 'center',
    minWidth: 200,
  },
  recordingModalIcon: {
    width: 64,
    height: 64,
    marginBottom: spacing[3],
  },
  recordingModalText: {
    ...createTextStyle('lg', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.semibold,
    }),
    marginBottom: spacing[2],
  },
  recordingModalHint: {
    ...createTextStyle('sm', {
      color: colors.text.secondary,
    }),
  },
  recordingModalCancelButton: {
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[200],
    minWidth: 120,
    alignItems: 'center',
  },
  recordingModalCancelButtonText: {
    ...createTextStyle('base', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
});
