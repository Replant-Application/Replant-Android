/**
 * BirthYearSelector 스타일
 * 출생연도 선택 컴포넌트의 모든 스타일 정의
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { createTextStyle, createTitleStyle, createSecondaryTextStyle, createErrorTextStyle } from '../../../utils/styles/textStyles';
import { dropdownStyles } from '../../../utils/styles/componentStyles';

export const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    ...createTitleStyle('base', {
      marginBottom: spacing[2],
    }),
  },
  dropdownButton: {
    ...dropdownStyles.button(),
  },
  dropdownButtonText: {
    ...dropdownStyles.buttonText(),
  },
  dropdownPlaceholder: {
    ...dropdownStyles.placeholder(),
  },
  dropdownArrow: {
    ...createSecondaryTextStyle('sm', {
      marginLeft: spacing[2],
    }),
  },
  dropdownList: {
    ...dropdownStyles.list(),
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownListItem: {
    ...dropdownStyles.listItem(),
  },
  dropdownListItemFirst: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  dropdownListItemSelected: {
    ...dropdownStyles.listItemSelected(),
  },
  dropdownListItemText: {
    ...createTextStyle('base'),
  },
  dropdownListItemTextSelected: {
    ...createTextStyle('base', {
      color: colors.primary[700],
      fontWeight: typography.fontWeight.medium,
    }),
  },
  errorText: {
    ...createErrorTextStyle('sm', {
      marginTop: spacing[1],
    }),
  },
});
