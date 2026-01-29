import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../utils/designTokens';
import { useFactorSelectionStepContainer } from './FactorSelectionStep.container';
import { styles, COLUMNS } from './FactorSelectionStep.styles';

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
                accessibilityRole="button"
                accessibilityLabel={factor}
                accessibilityState={{ selected: isSelected }}
                accessibilityHint={isSelected ? `${factor} 선택됨, 탭하여 선택 해제` : `${factor} 선택되지 않음, 탭하여 선택`}
              >
                <Text 
                  style={[styles.factorButtonText, isSelected && styles.factorButtonTextSelected]}
                  accessibilityElementsHidden={true}
                >
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
          autoComplete="off"
          textContentType="none"
          accessibilityLabel="감정 요인 직접 입력"
          accessibilityHint="감정 요인을 직접 입력하세요. 자동완성 기능이 비활성화되어 있습니다"
        />
      </View>
    </View>
  );
};

export default FactorSelectionStep;

