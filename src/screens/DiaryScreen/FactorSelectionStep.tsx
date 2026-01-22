import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { useFactorSelectionStepContainer } from './FactorSelectionStep.container';

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
  // 비즈니스 로직은 Container에서 처리
  const { getFactorButtonStyle, isFactorSelected, factorOptions } = useFactorSelectionStepContainer({
    selectedFactors,
    customFactor,
    onToggleFactor,
    onCustomFactorChange,
  });

  // 요인을 행 단위로 그룹화
  const renderFactorGrid = () => {
    const rows = [];
    for (let i = 0; i < factorOptions.length; i += COLUMNS) {
      const rowFactors = factorOptions.slice(i, i + COLUMNS);
      rows.push(
        <View key={i} style={styles.factorRow}>
          {rowFactors.map((factor) => {
            const isSelected = isFactorSelected(factor);
            const buttonStyle = getFactorButtonStyle(factor);
            return (
              <TouchableOpacity
                key={factor}
                style={[styles.factorButton, buttonStyle]}
                onPress={() => onToggleFactor(factor)}
                activeOpacity={0.7}
              >
                <Text style={[styles.factorButtonText, isSelected && styles.factorButtonTextSelected]}>
                  {factor}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* 빈 공간 채우기 (마지막 행) */}
          {rowFactors.length < COLUMNS &&
            Array(COLUMNS - rowFactors.length)
              .fill(0)
              .map((_, idx) => <View key={`empty-${idx}`} style={styles.factorButtonEmpty} />)
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

