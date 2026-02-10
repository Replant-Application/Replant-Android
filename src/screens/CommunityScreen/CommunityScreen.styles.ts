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
  modalMissionSetDetailWrap: {
    flex: 1,
  },
  modalMissionSetDetailContent: {
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
  topTabContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  filterContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
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
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  filterIcon: {
    width: 22,
    height: 22,
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
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    width: '85%',
    maxWidth: 350,
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: '80%',
    zIndex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    ...createTitleStyle('xl', {
      marginBottom: spacing[4],
      textAlign: 'center',
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
  filterOptionLabel: {
    ...createTextStyle('base', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
    flex: 1,
  },
  filterCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  filterCheckboxBox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.gray[400],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCheckboxBoxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterCheckboxCheckmark: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
    }),
  },
  modalApplyButton: {
    ...buttonStyles.primary(),
    marginTop: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 44,
    borderRadius: borderRadius.lg,
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
    paddingBottom: spacing[4],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: 128, // 하단 탭바와의 간격 더 확보 (spacing[24] * 1.33)
    gap: spacing[4],
  },
  paginationButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.base,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minWidth: 60,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  paginationButtonText: {
    ...createButtonTextStyle('sm', {
      color: colors.white,
    }),
  },
  paginationButtonTextDisabled: {
    ...createButtonTextStyle('sm', {
      color: colors.text.tertiary,
    }),
  },
  paginationInfo: {
    ...createTextStyle('sm', {
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
    minWidth: 60,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[400], // 필터 옵션과 통일
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[400], // 필터 옵션과 통일
    elevation: 4,
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    lineHeight: 32,
  },
  fabIconImage: {
    width: 22,
    height: 22,
    tintColor: colors.white,
  },
  fabText: {
    ...createTextStyle('3xl', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
      marginTop: -2,
    }),
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
    ...createTextStyle('3xl', {
      color: colors.text.secondary,
    }),
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
  shareButton: {
    ...buttonStyles.primary(),
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  shareButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  shareButtonText: {
    ...createButtonTextStyle('sm'),
  },
  shareButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  /** 모달 하단 탭 바 (투두리스트 상세 모달에서 탭 전환용) */
  modalTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: Platform.OS === 'android' ? spacing[12] : spacing[5],
    paddingTop: spacing[2],
    paddingHorizontal: spacing[2],
  },
  modalTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[1],
    borderRadius: 12,
  },
  modalTabActive: {
    backgroundColor: colors.green[50],
  },
  modalTabIcon: {
    width: 24,
    height: 24,
    marginBottom: 2,
    opacity: 0.6,
  },
  modalTabIconActive: {
    opacity: 1,
  },
  modalTabLabel: {
    ...createSecondaryTextStyle('xs'),
    color: colors.text.secondary,
  },
  modalTabLabelActive: {
    color: colors.green[600],
  },
  // 투두리스트 공유 필터 모달 스타일
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  filterOptionHorizontal: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full, // 둥근 모서리 배지 스타일
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  filterOptionActive: {
    borderColor: colors.primary[400],
    backgroundColor: colors.primary[50],
  },
  filterOptionText: {
    ...createTextStyle('base', {
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
      fontFamily: Platform.select({
        ios: undefined,
        android: typography.fontFamily.regular,
      }),
    }),
  },
  filterOptionTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
});
