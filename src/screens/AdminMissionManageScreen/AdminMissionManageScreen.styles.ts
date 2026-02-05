/**
 * AdminMissionManageScreen 스타일
 * 관리자 미션 관리 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/styles/textStyles';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { inputStyles, modalStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  filterButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterButtonText: {
    ...createSecondaryTextStyle('sm'),
  },
  filterButtonTextActive: {
    ...createButtonTextStyle('sm', {
      color: colors.text.inverse,
    }),
  },
  addButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.text.inverse,
    }),
  },
  missionList: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyText: {
    ...createTextStyle('base', {
      color: colors.text.tertiary,
    }),
  },
  missionCard: {
    marginBottom: spacing[4],
  },
  missionHeader: {
    marginBottom: spacing[3],
  },
  missionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  missionTitle: {
    ...createTitleStyle('lg', {
      flex: 1,
    }),
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  activeBadge: {
    backgroundColor: colors.primary[100],
  },
  inactiveBadge: {
    backgroundColor: colors.gray[100],
  },
  statusText: {
    ...createTextStyle('xs', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  activeText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  inactiveText: {
    ...createTextStyle('xs', {
      color: colors.gray[600],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  missionDescription: {
    ...createSecondaryTextStyle('sm'),
  },
  missionMeta: {
    flexDirection: 'row',
    gap: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[3],
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginBottom: spacing[1],
    }),
  },
  metaValue: {
    ...createTitleStyle('sm'),
  },
  missionActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionButtonText: {
    ...createSecondaryTextStyle('sm'),
  },
  editButton: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  editButtonText: {
    ...createTextStyle('sm', {
      color: colors.primary[600],
    }),
  },
  deleteButton: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  deleteButtonText: {
    ...createTextStyle('sm', {
      color: colors.error[600],
    }),
  },
  // Modal styles
  modalOverlay: {
    ...modalStyles.overlayBottomSheet(),
  },
  modalContent: {
    ...modalStyles.contentBottomSheet(),
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[5],
    maxHeight: '90%',
  },
  inputLabel: {
    ...createTitleStyle('sm', {
      marginBottom: spacing[2],
      marginTop: spacing[3],
    }),
  },
  input: {
    ...inputStyles.base(),
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlignVertical: 'top',
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  optionButtonText: {
    ...createSecondaryTextStyle('sm'),
  },
  optionButtonTextActive: {
    ...createButtonTextStyle('sm', {
      color: colors.text.inverse,
    }),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[3],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    ...createTextStyle('sm', {
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  checkboxLabel: {
    ...createTextStyle('base', {
      color: colors.text.primary,
    }),
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[6],
    paddingBottom: spacing[4],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    ...createSecondaryTextStyle('base', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.text.inverse,
    }),
  },
});
