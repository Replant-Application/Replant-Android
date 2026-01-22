/**
 * 성별 선택 컴포넌트
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { getOptimizedLineHeight } from '../../../utils/textStyles';
import { Gender, SignUpErrors } from '../../../types/screens/auth';

interface GenderSelectorProps {
  gender: Gender | null;
  onGenderChange: (gender: Gender) => void;
  error?: string;
  onErrorClear?: () => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({
  gender,
  onGenderChange,
  error,
  onErrorClear,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>성별</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'MALE' && styles.genderButtonSelected,
          ]}
          onPress={() => {
            onGenderChange('MALE');
            if (onErrorClear) {
              onErrorClear();
            }
          }}
        >
          <Text style={[
            styles.genderButtonText,
            gender === 'MALE' && styles.genderButtonTextSelected,
          ]}>남성</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'FEMALE' && styles.genderButtonSelected,
          ]}
          onPress={() => {
            onGenderChange('FEMALE');
            if (onErrorClear) {
              onErrorClear();
            }
          }}
        >
          <Text style={[
            styles.genderButtonText,
            gender === 'FEMALE' && styles.genderButtonTextSelected,
          ]}>여성</Text>
        </TouchableOpacity>
      </View>
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
  genderContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  genderButton: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  genderButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  genderButtonTextSelected: {
    color: colors.primary[700],
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

export default GenderSelector;
