import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { FACTOR_OPTIONS } from './DiaryScreen.constants';

interface FactorSelectionStepProps {
  selectedFactors: string[];
  customFactor: string;
  onToggleFactor: (factor: string) => void;
  onCustomFactorChange: (text: string) => void;
  onShowCustomInput: () => void;
  showCustomInput: boolean;
}

const FactorSelectionStep: React.FC<FactorSelectionStepProps> = ({
  selectedFactors,
  customFactor,
  onToggleFactor,
  onCustomFactorChange,
  onShowCustomInput,
  showCustomInput,
}) => {
  const getFactorColor = (factor: string): string => {
    const colorMap: { [key: string]: string } = {
      '공부': colors.orange[500],
      '가족': colors.green[500],
      '운동': colors.red[500],
      '돈': colors.red[700],
      '취미생활': colors.purple[500],
      '친구': colors.purple[700],
      '연인': colors.blue[400],
      '잠': colors.green[700],
      '게임': colors.gray[400],
      '인간관계': colors.blue[500],
      '일': colors.blue[300],
    };
    return colorMap[factor] || colors.gray[500];
  };

  return (
    <View style={styles.container}>
      {/* 요인 선택 버튼들 */}
      <ScrollView 
        style={styles.factorsContainer}
        contentContainerStyle={styles.factorsContent}
        showsVerticalScrollIndicator={false}
      >
        {FACTOR_OPTIONS.map((factor) => {
          const factorColor = getFactorColor(factor);
          const isSelected = selectedFactors.includes(factor);
          return (
            <TouchableOpacity
              key={factor}
              style={[
                styles.factorButton,
                {
                  borderColor: factorColor,
                  backgroundColor: isSelected ? factorColor : 'transparent',
                },
                isSelected && styles.factorButtonSelected
              ]}
              onPress={() => onToggleFactor(factor)}
            >
              <Text style={[
                styles.factorButtonText,
                isSelected && styles.factorButtonTextSelected
              ]}>
                {factor}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {/* 직접 입력 버튼 */}
        <TouchableOpacity
          style={styles.customInputButton}
          onPress={onShowCustomInput}
        >
          <Image
            source={require('../../assets/images/pencil.png')}
            style={styles.customInputIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </ScrollView>

      {/* 텍스트 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            !showCustomInput && styles.textInputDisabled
          ]}
          value={customFactor}
          onChangeText={onCustomFactorChange}
          placeholder="아무 이유 없음"
          placeholderTextColor={colors.text.tertiary}
          multiline={true}
          textAlignVertical="top"
          editable={showCustomInput}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  factorsContainer: {
    maxHeight: 200,
    marginBottom: spacing[3],
  },
  factorsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    paddingBottom: 2,

  },
  factorButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  factorButtonSelected: {
    borderWidth: 2,
  },
  factorButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  factorButtonTextSelected: {
    color: colors.gray[900],
    fontWeight: typography.fontWeight.medium,
  },
  customInputButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[0],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[300],
    minWidth: 40,
    minHeight: 30,
  },
  customInputIcon: {
    width: 20,
    height: 20,
    tintColor: colors.gray[900],
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    minHeight: 150,
    fontSize: typography.fontSize.base,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  textInputDisabled: {
    opacity: 0.5,
  },
});

export default FactorSelectionStep;

