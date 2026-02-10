import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Alert, Platform } from 'react-native';
import { colors, typography } from '../../utils/designTokens';
import { useFactorSelectionStepContainer } from './FactorSelectionStep.container';
import { styles, COLUMNS } from './FactorSelectionStep.styles';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

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
  const [isListening, setIsListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const voiceCommittedRef = useRef(''); // 음성으로 확정된 텍스트

  // 음성 인식 사용 가능 여부 확인
  useEffect(() => {
    const check = async () => {
      try {
        const available = ExpoSpeechRecognitionModule?.isRecognitionAvailable?.() ?? false;
        setVoiceAvailable(available);
      } catch {
        setVoiceAvailable(false);
      }
    };
    check();
  }, []);

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));

  useSpeechRecognitionEvent('result', (event: { results: Array<{ transcript?: string }>; isFinal?: boolean }) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) return;
    const isFinal = event.isFinal === true;
    if (isFinal) {
      voiceCommittedRef.current = voiceCommittedRef.current
        ? `${voiceCommittedRef.current} ${transcript}`
        : transcript;
      onCustomFactorChange(voiceCommittedRef.current);
    } else {
      // 말하는 동안 실시간으로 입력창에 보여줌
      onCustomFactorChange(
        voiceCommittedRef.current
          ? `${voiceCommittedRef.current} ${transcript}`
          : transcript
      );
    }
  });

  useSpeechRecognitionEvent('error', (event: { error?: string; message?: string }) => {
    setIsListening(false);
    if (event.error && event.error !== 'aborted' && event.error !== 'no-speech') {
      Alert.alert('음성 인식', event.message || '음성 인식 중 문제가 발생했어요.');
    }
  });

  const handleVoicePress = useCallback(async () => {
    if (!voiceAvailable) {
      Alert.alert('음성 입력', '이 기기에서는 음성 인식을 사용할 수 없어요.');
      return;
    }
    try {
      if (isListening) {
        ExpoSpeechRecognitionModule.stop();
        return;
      }
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert('마이크 권한', '음성 입력을 쓰려면 마이크 권한이 필요해요.');
        return;
      }
      voiceCommittedRef.current = customFactor; // 녹음 시작 시점의 입력값 유지 (이어쓰기)
      ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      Alert.alert('음성 입력', '음성 인식을 시작할 수 없어요.');
    }
  }, [voiceAvailable, isListening, customFactor]);

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

  const summaryParts = [...selectedFactors];
  if (customFactor.trim()) summaryParts.push(customFactor.trim());
  const summaryLabel = summaryParts.length > 0
    ? `선택된 요인: ${summaryParts.join(', ')}. 탭하여 선택 해제할 수 있습니다.`
    : '선택된 요인이 없습니다. 아래에서 선택하거나 직접 입력하세요.';

  return (
    <View style={styles.container}>
      {/* 선택된 요인 요약: 어떤 걸 선택했는지 확인 가능 */}
      <View style={styles.summaryContainer} accessibilityRole="summary" accessibilityLabel={summaryLabel}>
        <Text style={styles.summaryLabel}>선택된 요인</Text>
        <Text style={styles.summaryText}>
          {summaryParts.length > 0 ? summaryParts.join(', ') : '없음'}
        </Text>
      </View>
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
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, { color: '#FFFFFF' }]}
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
            selectionColor={colors.primary[500]}
          />
          {voiceAvailable && (
            <TouchableOpacity
              style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
              onPress={handleVoicePress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isListening ? '음성 입력 중지' : '녹음하여 말하기'}
              accessibilityState={{ selected: isListening }}
            >
              <Image
                source={require('../../assets/images/record.png')}
                style={styles.voiceButtonIcon}
                resizeMode="contain"
                accessibilityLabel={isListening ? '녹음 중' : '녹음'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 녹음 중 모달 */}
      <Modal
        visible={isListening}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.recordingModalOverlay}>
          <View style={styles.recordingModalContent}>
            <Image
              source={require('../../assets/images/recording.png')}
              style={styles.recordingModalIcon}
              resizeMode="contain"
              accessibilityLabel="녹음 중"
            />
            <Text style={styles.recordingModalText}>녹음중입니다</Text>
            <Text style={styles.recordingModalHint}>다시 누르면 녹음이 끝나요</Text>
            <TouchableOpacity
              style={styles.recordingModalCancelButton}
              onPress={() => {
                ExpoSpeechRecognitionModule.abort();
                onCustomFactorChange(voiceCommittedRef.current);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="녹음 취소"
            >
              <Text style={styles.recordingModalCancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FactorSelectionStep;

