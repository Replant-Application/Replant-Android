/**
 * ReantChatBottomSheet 스타일
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createSecondaryTextStyle } from '../../utils/styles/textStyles';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '45%',
    minHeight: '35%',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingTop: spacing[3],
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...createTextStyle('lg', {
      fontWeight: typography.fontWeight.semibold,
    }),
  },
  closeButton: {
    padding: spacing[1],
  },
  closeButtonText: {
    ...createTextStyle('lg', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.normal,
    }),
  },
  messagesContainer: {
    flex: 1,
    minHeight: 150,
  },
  messagesList: {
    padding: spacing[4],
    paddingBottom: spacing[2],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyText: {
    ...createSecondaryTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing[3],
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
  reantMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing[3],
  },
  reantMessageBubble: {
    maxWidth: '75%',
  },
  reantMessageBubbleImage: {
    minHeight: 60,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  reantMessageTextContainer: {
    width: '100%',
  },
  reantMessageText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
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
    paddingVertical: spacing[3],
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
