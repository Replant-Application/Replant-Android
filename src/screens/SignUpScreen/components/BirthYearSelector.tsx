/**
 * 출생연도 선택 컴포넌트
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { getOptimizedLineHeight } from '../../../utils/textStyles';
import { getBirthYears } from '../SignUpScreen.constants';

interface BirthYearSelectorProps {
  birthYear: number | null;
  onBirthYearChange: (year: number) => void;
  showModal: boolean;
  onModalToggle: () => void;
  onOtherModalClose?: () => void;
  error?: string;
  onErrorClear?: () => void;
}

const BirthYearSelector: React.FC<BirthYearSelectorProps> = ({
  birthYear,
  onBirthYearChange,
  showModal,
  onModalToggle,
  onOtherModalClose,
  error,
  onErrorClear,
}) => {
  const birthYears = getBirthYears();

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>출생연도</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          if (onOtherModalClose) {
            onOtherModalClose();
          }
          onModalToggle();
        }}
      >
        <Text style={[
          styles.dropdownButtonText,
          !birthYear && styles.dropdownPlaceholder,
        ]}>
          {birthYear ? `${birthYear}년` : '출생연도를 선택해주세요'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {showModal && (
        <View style={styles.dropdownList}>
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            style={styles.dropdownScrollView}
          >
            {birthYears.map((item, index) => (
              <TouchableOpacity
                key={item.toString()}
                style={[
                  styles.dropdownListItem,
                  index === 0 && styles.dropdownListItemFirst,
                  birthYear === item && styles.dropdownListItemSelected,
                ]}
                onPress={() => {
                  onBirthYearChange(item);
                  onModalToggle();
                  if (onErrorClear) {
                    onErrorClear();
                  }
                }}
              >
                <Text style={[
                  styles.dropdownListItemText,
                  birthYear === item && styles.dropdownListItemTextSelected,
                ]}>
                  {item}년
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dropdownPlaceholder: {
    color: colors.text.tertiary,
  },
  dropdownArrow: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginTop: spacing[1],
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownListItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  dropdownListItemFirst: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  dropdownListItemSelected: {
    backgroundColor: colors.primary[50],
  },
  dropdownListItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dropdownListItemTextSelected: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.red[500],
    marginTop: spacing[1],
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default BirthYearSelector;
