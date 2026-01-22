/**
 * DiaryScreen 스타일
 * 일기 화면의 모든 스타일 정의
 */

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { createTextStyle, createTitleStyle, createBodyStyle, createSecondaryTextStyle, createButtonTextStyle } from '../../utils/styles/textStyles';
import { buttonStyles } from '../../utils/styles/commonStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalContainerWelcome: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    paddingVertical: spacing[8],
    marginHorizontal: spacing[4],
    marginTop: spacing[20],
    minHeight: 180,
    ...shadows.lg,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[12],
    maxHeight: SCREEN_HEIGHT * 0.8,
    ...shadows.lg,
  },
  modalQuestion: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    ...createTextStyle('xl', {
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
      textAlign: 'left',
      marginBottom: spacing[1],
    }),
  },
  modalContent: {
    marginBottom: spacing[3],
  },
  modalContentFactors: {
    marginBottom: spacing[3],
    minHeight: 300,
  },
  modalContentExpression: {
    marginTop: spacing[8],
    marginBottom: spacing[4],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  modalButtonsExpression: {
    marginTop: spacing[3],
  },
  moodContainer: {
    paddingVertical: spacing[1],
  },
  sliderValueContainer: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  sliderTrack: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
    marginVertical: spacing[3],
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    height: 16,
    borderRadius: borderRadius.sm,
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginLeft: -10,
    top: -2,
    ...shadows.lg,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[0],
  },
  sliderLabel: {
    ...createTextStyle('sm', {
      color: colors.gray[300],
    }),
  },
  sliderValue: {
    ...createTextStyle('2xl', {
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    }),
  },
  emotionsContainer: {
    maxHeight: 450,
  },
  emotionsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  emotionTag: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  emotionTagSelected: {
    borderWidth: 2,
  },
  emotionTagText: {
    ...createTextStyle('sm', {
      color: colors.white,
    }),
  },
  emotionTagTextSelected: {
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    width: '100%',
    height: 260,
  },
  textInput: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    height: 260,
    ...createTextStyle('base', {
      color: colors.white,
      borderWidth: 1,
      borderColor: colors.gray[700],
      textAlignVertical: 'top',
    }),
  },
  cancelButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...createTextStyle('sm', {
      color: colors.gray[900],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  skipButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  skipButtonText: {
    ...createTextStyle('sm', {
      color: colors.gray[900],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  confirmButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(75, 85, 99, 0.5)',
    opacity: 0.5,
  },
  confirmButtonText: {
    ...createTextStyle('sm', {
      color: colors.gray[800],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  characterContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.05,
    left: '43%',
    transform: [{ translateX: -(SCREEN_WIDTH * 0.6) / 2 }],
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
  backButton: {
    padding: spacing[2],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
  },
  writeButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeButtonText: {
    ...createBodyStyle('base', {
      color: colors.gray[900],
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    }),
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    alignItems: 'center',
  },
  viewButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.white,
    }),
  },
  nextButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
  },
  nextButtonText: {
    ...createBodyStyle('base', {
      color: colors.gray[900],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  viewContainer: {
    flex: 1,
    paddingTop: spacing[8],
    paddingHorizontal: spacing[5],
  },
  viewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[8],
    marginBottom: spacing[2],
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing[1],
    gap: spacing[1],
  },
  viewModeButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  viewModeButtonText: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  viewModeButtonTextActive: {
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[2],
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  searchInputContainer: {
    flex: 0,
    width: 300,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  searchInput: {
    width: '100%',
    paddingVertical: spacing[2],
    paddingLeft: spacing[3],
    paddingRight: spacing[10], // X 버튼 공간 확보
    ...createTextStyle('base', {
      color: colors.white,
    }),
  },
  searchButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: colors.gray[600],
    opacity: 0.5,
  },
  searchButtonText: {
    ...createButtonTextStyle('sm'),
  },
  searchClearButton: {
    position: 'absolute',
    right: spacing[2],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    zIndex: 1,
  },
  searchClearText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    paddingBottom: spacing[6],
  },
  dateGroup: {
    marginBottom: spacing[4],
  },
  dateGroupTitle: {
    ...createTitleStyle('lg', {
      color: colors.white,
      marginBottom: spacing[2],
      paddingHorizontal: spacing[2],
    }),
  },
  diaryListItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  diaryListItemContent: {
    width: '100%',
  },
  diaryListItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  diaryListItemEmotion: {
    fontSize: typography.fontSize.xl,
  },
  diaryListItemDate: {
    ...createTextStyle('xs', {
      color: colors.gray[300],
    }),
  },
  diaryListItemText: {
    ...createBodyStyle('base', {
      color: colors.white,
      marginBottom: spacing[2],
    }),
  },
  diaryListItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    alignItems: 'center',
  },
  diaryListItemTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  diaryListItemTagText: {
    ...createTextStyle('xs', {
      color: colors.white,
    }),
  },
  diaryListItemTagMore: {
    ...createTextStyle('xs', {
      color: colors.gray[400],
    }),
  },
  bookPageInfo: {
    ...createTextStyle('sm', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  topSection: {
    alignItems: 'center',
  },
  bookContainer: {
    alignItems: 'center',
    marginTop: spacing[0],
    position: 'relative',
  },
  bookImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.7 * 1,
  },
  paperContainer: {
    position: 'absolute',
    top: SCREEN_WIDTH * 0.3,
    left: SCREEN_WIDTH * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6 * 1.3,
  },
  paperImage: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.6 * 1.1,
  },
  paperTextOverlay: {
    position: 'absolute',
    top: spacing[15],
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    zIndex: 2,
  },
  paperTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.black,
      marginBottom: spacing[2],
    }),
  },
  paperDate: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      color: colors.black,
      textAlign: 'center',
    }),
  },
  bookNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    right: 20,
    alignItems: 'center',
    marginTop: -spacing[8],
    paddingHorizontal: spacing[26],
    width: '110%',
  },
  navButton: {
    padding: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[800],
    opacity: 0.8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    ...createTextStyle('xl', {
      color: colors.white,
      fontWeight: typography.fontWeight.medium,
    }),
  },
  viewDetailButton: {
    marginTop: -spacing[20],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.green[600],
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 120,
  },
  viewDetailButtonText: {
    ...createButtonTextStyle('sm'),
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...createTitleStyle('lg', {
      color: colors.white,
    }),
  },
  detailContainer: {
    flex: 1,
    paddingTop: spacing[8],
    paddingHorizontal: spacing[5],
  },
  signboardContainer: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  signboard: {
    backgroundColor: colors.orange[900],
    borderRadius: borderRadius.xl,
    padding: spacing[2],
    width: SCREEN_WIDTH * 0.85,
    ...shadows.lg,
  },
  signboardPaper: {
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.lg,
    padding: spacing[5],
  },
  signboardTitle: {
    ...createBodyStyle('base', {
      fontWeight: typography.fontWeight.medium,
      marginTop: spacing[3],
      marginBottom: spacing[2],
    }),
  },
  signboardContent: {
    ...createSecondaryTextStyle('sm', {
      marginBottom: spacing[4],
    }),
  },
  signboardContentText: {
    ...createSecondaryTextStyle('sm', {
      lineHeight: getOptimizedLineHeight(typography.fontSize.base),
      marginBottom: spacing[4],
    }),
  },
  signboardScrollView: {
    flex: 1,
  },
  signboardScrollContent: {
    paddingBottom: spacing[2],
  },
  emotionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  detailEmotionTag: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  detailEmotionTagText: {
    ...createTextStyle('sm', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  factorTag: {
    backgroundColor: colors.orange[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.orange[300],
  },
  factorTagText: {
    ...createTextStyle('sm', {
      color: colors.orange[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  detailButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[8],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[2],
  },
  backToListButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[700],
    alignItems: 'center',
  },
  backToListButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.white,
    }),
  },
  deleteButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...createButtonTextStyle('base', {
      color: colors.white,
    }),
  },
});
