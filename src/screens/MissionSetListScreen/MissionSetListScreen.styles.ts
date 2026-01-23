/**
 * MissionSetListScreen 스타일
 * 투두리스트(미션세트) 공유 화면의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { cardStyles, modalStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  createButton: {
    padding: spacing[2],
  },
  createButtonIcon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
    tintColor: colors.text.tertiary,
  },
  searchInput: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.text.primary,
      padding: 0,
    }),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[3],
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.primary[700],
    }),
  },
  missionSetList: {
    gap: spacing[2],
  },
  missionSetCard: {
    ...cardStyles.base(),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginRight: spacing[2],
  },
  cardIcon: {
    width: 20,
    height: 20,
  },
  missionSetTitle: {
    flex: 1,
    ...createTextStyle('base', {
      fontWeight: typography.fontWeight.normal,
      color: colors.text.primary,
    }),
  },
  copyButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
  },
  copyButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.white,
    }),
  },
  missionSetDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[2],
    }),
  },
  authorInfo: {
    marginBottom: spacing[2],
  },
  authorText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  statText: {
    ...createSecondaryTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
    }),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stars: {
    ...createTextStyle('sm', {
      color: colors.warning,
    }),
  },
  ratingText: {
    ...createSecondaryTextStyle('xs'),
  },
  shareButton: {
    padding: spacing[2],
  },
  shareButtonIcon: {
    width: 24,
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    width: '80%',
    maxWidth: 400,
    maxHeight: '80%',
    paddingBottom: spacing[6],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...createTitleStyle('xl'),
  },
  modalCloseText: {
    ...createTextStyle('base', {
      color: colors.primary[500],
    }),
  },
  modalLoading: {
    padding: spacing[8],
    alignItems: 'center',
  },
  modalLoadingText: {
    ...createSecondaryTextStyle('base'),
  },
  modalEmpty: {
    padding: spacing[8],
    alignItems: 'center',
  },
  modalEmptyText: {
    ...createTextStyle('base', {
      color: colors.text.primary,
      marginBottom: spacing[2],
    }),
  },
  modalEmptySubText: {
    ...createSecondaryTextStyle('sm'),
  },
  modalList: {
    padding: spacing[4],
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  modalItemIcon: {
    width: 24,
    height: 24,
  },
  modalItemTextContainer: {
    flex: 1,
  },
  modalItemTitle: {
    ...createTitleStyle('base', {
      marginBottom: spacing[0.5],
    }),
  },
  modalItemDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[0.5],
    }),
  },
  modalItemInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  modalItemMissionCount: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  completedBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  completedBadgeText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  modalItemArrow: {
    width: 16,
    height: 16,
    tintColor: colors.text.tertiary,
    marginLeft: spacing[2],
  },
});
