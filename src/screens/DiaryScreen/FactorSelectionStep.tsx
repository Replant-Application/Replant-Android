import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { FACTOR_OPTIONS } from './DiaryScreen.constants';
import { addOpacity } from './DiaryScreen.utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 3; // 그리드 열 수
const BUTTON_GAP = spacing[1]; // 버튼 간격
const CONTAINER_PADDING = spacing[3]; // 컨테이너 패딩
// modalContainer의 marginHorizontal (spacing[4]) + padding (spacing[3]) + content의 paddingHorizontal (CONTAINER_PADDING) 모두 고려
const MODAL_MARGIN = spacing[4]; // modalContainer의 marginHorizontal
const MODAL_PADDING = spacing[3]; // modalContainer의 padding
const AVAILABLE_WIDTH = SCREEN_WIDTH - (MODAL_MARGIN * 2) - (MODAL_PADDING * 2) - (CONTAINER_PADDING * 2);
const BUTTON_WIDTH = (AVAILABLE_WIDTH - BUTTON_GAP * (COLUMNS - 1)) / COLUMNS;

interface FactorSelectionStepProps {
  selectedFactors: string[];
  customFactor: string;
  onToggleFactor: (factor: string) => void;
  onCustomFactorChange: (text: string) => void;
}

const FactorSelectionStep: React.FC<FactorSelectionStepProps> = ({
  selectedFactors,
  customFactor,
  onToggleFactor,
  onCustomFactorChange,
}) => {
  // 요인별 색상 매핑
  const getFactorColor = (factor: string): string => {
    const factorColorMap: Record<string, string> = {
      // 생활/일상
      '공부': colors.blue[500],
      '학업': colors.blue[600],
      '일': colors.blue[400],
      '취업': colors.purple[500],
      // 관계
      '가족': colors.green[500],
      '친구': colors.green[400],
      '연인': colors.red[400],
      '인간관계': colors.purple[400],
      // 건강/여가
      '운동': colors.green[600],
      '건강': colors.green[300],
      '취미생활': colors.orange[400],
      '게임': colors.purple[500],
      '여행': colors.blue[300],
      // 물질/시간
      '돈': colors.orange[600],
      '음식': colors.orange[500],
      '잠': colors.blue[800],
      // 시간
      '미래': colors.purple[300],
      '과거': colors.gray[500],
    };
    
    return factorColorMap[factor] || colors.gray[500];
  };

  // 요인을 행 단위로 그룹화
  const renderFactorGrid = () => {
    const rows = [];
    for (let i = 0; i < FACTOR_OPTIONS.length; i += COLUMNS) {
      const rowFactors = FACTOR_OPTIONS.slice(i, i + COLUMNS);
      rows.push(
        <View key={i} style={styles.factorRow}>
          {rowFactors.map((factor) => {
            const isSelected = selectedFactors.includes(factor);
            const factorColor = getFactorColor(factor);
            return (
              <TouchableOpacity
                key={factor}
                style={[
                  styles.factorButton,
                  {
                    backgroundColor: isSelected 
                      ? addOpacity(factorColor, 0.3) 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderColor: isSelected 
                      ? addOpacity(factorColor, 0.5) 
                      : 'rgba(255, 255, 255, 0.3)',
                  },
                ]}
                onPress={() => onToggleFactor(factor)}
                activeOpacity={0.7}
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
          {/* 빈 공간 채우기 (마지막 행) */}
          {rowFactors.length < COLUMNS && 
            Array(COLUMNS - rowFactors.length).fill(0).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.factorButtonEmpty} />
            ))
          }
        </View>
      );
    }
    
    return rows;
  };

  return (
    <View style={styles.container}>
      {/* 요인 선택 버튼들 */}
      <ScrollView 
        style={styles.factorsContainer}
        contentContainerStyle={styles.factorsContent}
        showsVerticalScrollIndicator={false}
      >
        {renderFactorGrid()}
      </ScrollView>

      {/* 텍스트 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={customFactor}
          onChangeText={onCustomFactorChange}
          placeholder="직접 입력하기"
          placeholderTextColor={colors.text.tertiary}
          multiline={false}
          editable={true}
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
    maxHeight: 400,
    marginBottom: spacing[3],
  },
  factorsContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingBottom: spacing[2],
  },
  factorRow: {
    flexDirection: 'row',
    gap: BUTTON_GAP,
    marginBottom: BUTTON_GAP,
  },
  factorButton: {
    width: BUTTON_WIDTH,
    minHeight: spacing[8],
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorButtonEmpty: {
    width: BUTTON_WIDTH,
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
    textAlign: 'center',
  },
  factorButtonTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    height: 37,
    fontSize: typography.fontSize.sm,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[700],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
});

export default FactorSelectionStep;

