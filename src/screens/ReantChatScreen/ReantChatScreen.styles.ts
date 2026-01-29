/**
 * ReantChatScreen 스타일
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 말풍선 가로 폭 (middle 기준, 홈스크린과 동일하게)
const SPEECH_BUBBLE_WIDTH = SCREEN_WIDTH * 0.88;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 120 : 90,
  },
  // 1. 대화 종료하기 버튼 (상단) - 홈스크린 스타일 적용
  topButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  endChatButton: {
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
  endChatButtonText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
    }),
  },
  // 2-3. 말풍선 + 리앤트 캐릭터 영역
  heroSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing[2],
  },
  characterImageContainer: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  speechBubble: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: spacing[1],
  },
  // 3분할 말풍선 컨테이너 - 텍스트에 맞게 자동 조절
  speechBubbleContainer: {
    width: SPEECH_BUBBLE_WIDTH,
    alignItems: 'center',
  },
  speechBubbleTop: {
    width: SPEECH_BUBBLE_WIDTH,
    height: 12,
  },
  speechBubbleMiddle: {
    width: SPEECH_BUBBLE_WIDTH,
    minHeight: 40,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechBubbleBottom: {
    width: SPEECH_BUBBLE_WIDTH,
    height: 28,
  },
  // 기존 단일 이미지용 (홈스크린에서 사용)
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
  // 둥둥 떠다니는 사용자 메시지
  floatingMessageContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  floatingMessageBubble: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    maxWidth: SCREEN_WIDTH * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingMessageText: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    }),
  },
  // 4. 하단 입력창 - 둥근 모서리 + 키보드 반응형
  inputContainer: {
    marginHorizontal: spacing[3],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.overlay.white.heavy,
    borderRadius: borderRadius.xl,
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
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
    maxHeight: 100,
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
    minHeight: 44,
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
