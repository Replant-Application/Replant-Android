/**
 * CommunityScreen 스타일
 * 커뮤니티 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { modalStyles, emptyStateStyles, buttonStyles } from '../../utils/styles/commonStyles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  tabBar: {
    marginBottom: 0,
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[3],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterButton: {
    backgroundColor: '#8B6F47',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterIcon: {
    width: 26,
    height: 26,
    tintColor: colors.white,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderWidth: 1,
    borderColor: colors.primary[500],
    gap: spacing[1],
  },
  chipText: {
    ...createTextStyle('xs', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  chipClose: {
    ...createTextStyle('base', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
      lineHeight: 16,
    }),
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    ...createTextStyle('sm', {
      color: colors.text.primary,
      padding: 0,
      textAlignVertical: 'center',
    }),
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
    alignSelf: 'flex-start',
  },
  filterSelectorText: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.normal,
    }),
  },
  filterSelectorIcon: {
    ...createTextStyle('xs', {
      color: colors.text.secondary,
      marginLeft: spacing[2],
    }),
  },
  modalOverlay: {
    ...modalStyles.overlay(),
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    ...modalStyles.content(),
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: '80%',
    zIndex: 1,
    elevation: 5,
  },
  modalTitle: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[4],
    }),
  },
  modalSectionTitle: {
    ...createTextStyle('sm', {
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginTop: spacing[4],
      marginBottom: spacing[2],
    }),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.base,
    marginBottom: spacing[2],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  filterOptionText: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.normal,
    }),
  },
  filterOptionTextActive: {
    ...createBodyStyle('base', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  filterOptionCheck: {
    ...createBodyStyle('base', {
      color: colors.primary[600],
      fontWeight: typography.fontWeight.normal,
    }),
  },
  modalApplyButton: {
    ...buttonStyles.primary(),
    marginTop: spacing[6],
  },
  modalApplyButtonText: {
    ...createButtonTextStyle('base'),
  },
  content: {
    flex: 1,
    padding: spacing[4],
    paddingBottom: spacing[20], // 하단 탭바 높이 + 여유 공간
  },
  postsList: {
    gap: spacing[3],
    paddingBottom: spacing[16], // 추가 하단 여백
  },
  fab: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    lineHeight: 32,
  },
  fabIconImage: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    marginTop: -2,
  },
  // 투두 공유 관련 스타일
  missionSetFilterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[3],
  },
  missionSetSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  missionSetList: {
    gap: spacing[3],
    paddingBottom: spacing[16],
  },
  missionSetCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  missionSetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  missionSetTitle: {
    flex: 1,
    ...createTitleStyle('lg', {
      marginRight: spacing[2],
    }),
  },
  copyButton: {
    ...buttonStyles.primary(),
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  copyButtonText: {
    ...createButtonTextStyle('sm'),
  },
  missionSetDescription: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[3],
    }),
  },
  missionSetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  metaText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  metaDot: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      marginHorizontal: spacing[1],
    }),
  },
  missionSetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
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
    ...createTextStyle('xs', {
      color: colors.text.secondary,
    }),
  },
  addedCount: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  // 투두리스트 공유 모달 스타일
  shareModalOverlay: {
    ...modalStyles.overlayBottomSheet(),
  },
  shareModalContent: {
    ...modalStyles.contentBottomSheet(),
    paddingBottom: spacing[6],
  },
  shareModalHeader: {
    ...modalStyles.header(),
    padding: spacing[4],
  },
  shareModalTitle: {
    ...modalStyles.title(),
  },
  shareModalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalCloseText: {
    fontSize: 28,
    color: colors.text.secondary,
    lineHeight: 28,
  },
  shareModalSubtitle: {
    ...createSecondaryTextStyle('sm', {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    }),
  },
  shareModalList: {
    paddingHorizontal: spacing[4],
  },
  shareModalEmpty: {
    ...emptyStateStyles.container(),
  },
  shareModalEmptyText: {
    ...emptyStateStyles.text(),
    marginBottom: spacing[2],
  },
  shareModalEmptySubtext: {
    ...emptyStateStyles.subtext(),
  },
  shareModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  shareModalItemShared: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  shareModalItemContent: {
    flex: 1,
    marginRight: spacing[3],
  },
  shareModalItemTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing[1],
    }),
  },
  shareModalItemDesc: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[1],
    }),
  },
  shareModalItemMeta: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
    }),
  },
  shareModalItemAction: {
    minWidth: 60,
    alignItems: 'center',
  },
  sharedBadge: {
    backgroundColor: colors.gray[200],
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
  },
  sharedBadgeText: {
    ...createTextStyle('xs', {
      color: colors.text.tertiary,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  shareButton: {
    ...buttonStyles.primary(),
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  shareButtonText: {
    ...createButtonTextStyle('sm'),
  },
});
