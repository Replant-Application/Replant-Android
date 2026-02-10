import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, Alert } from 'react-native';
import { colors } from '../../utils/designTokens';
import { EMOTION_TAGS } from '../../constants/screens/diary';
import { getEmotionColor, addOpacity } from './DiaryScreen.utils';
import { styles, COLUMNS } from './EmotionSelectionStep.styles';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface EmotionSelectionStepProps {
  selectedEmotions: string[];
  customEmotion: string;
  onToggleEmotion: (emotion: string) => void;
  onCustomEmotionChange: (text: string) => void;
}

const EmotionSelectionStep: React.FC<EmotionSelectionStepProps> = ({
  selectedEmotions,
  customEmotion,
  onToggleEmotion,
  onCustomEmotionChange,
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
      onCustomEmotionChange(voiceCommittedRef.current);
    } else {
      // 말하는 동안 실시간으로 입력창에 보여줌
      onCustomEmotionChange(
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
      voiceCommittedRef.current = customEmotion; // 녹음 시작 시점의 입력값 유지 (이어쓰기)
      ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      Alert.alert('음성 입력', '음성 인식을 시작할 수 없어요.');
    }
  }, [voiceAvailable, isListening, customEmotion]);
  // 감정을 행 단위로 그룹화
  const renderEmotionGrid = () => {
    const rows = [];
    for (let i = 0; i < EMOTION_TAGS.length; i += COLUMNS) {
      const rowEmotions = EMOTION_TAGS.slice(i, i + COLUMNS);
      rows.push(
        <View key={i} style={styles.emotionRow}>
          {rowEmotions.map((emotion) => {
            const emotionColor = getEmotionColor(emotion);
            const isSelected = selectedEmotions.includes(emotion);
            return (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionTag,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    backgroundColor: isSelected 
                      ? addOpacity(emotionColor, 0.3) 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderColor: isSelected 
                      ? addOpacity(emotionColor, 0.5) 
                      : 'rgba(255, 255, 255, 0.3)',
                  },
                ]}
                onPress={() => onToggleEmotion(emotion)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={emotion}
                accessibilityState={{ selected: isSelected }}
                accessibilityHint={isSelected ? `${emotion} 선택됨, 탭하여 선택 해제` : `${emotion} 선택되지 않음, 탭하여 선택`}
              >
                <Text 
                  style={[
                    styles.emotionTagText,
                    isSelected && styles.emotionTagTextSelected
                  ]}
                  accessibilityElementsHidden={true}
                >
                  {emotion}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* 빈 공간 채우기 (마지막 행) */}
          {rowEmotions.length < COLUMNS && 
            Array(COLUMNS - rowEmotions.length).fill(0).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.emotionTagEmpty} />
            ))
          }
        </View>
      );
    }
    return rows;
  };

  const summaryParts = [...selectedEmotions];
  if (customEmotion.trim()) summaryParts.push(customEmotion.trim());
  const summaryLabel = summaryParts.length > 0
    ? `선택된 감정: ${summaryParts.join(', ')}. 탭하여 선택 해제할 수 있습니다.`
    : '선택된 감정이 없습니다. 아래에서 선택하거나 직접 입력하세요.';

  return (
    <View style={styles.container}>
      {/* 선택된 감정 요약: 어떤 걸 선택했는지 확인 가능 */}
      <View style={styles.summaryContainer} accessibilityRole="summary" accessibilityLabel={summaryLabel}>
        <Text style={styles.summaryLabel}>선택된 감정</Text>
        <Text style={styles.summaryText}>
          {summaryParts.length > 0 ? summaryParts.join(', ') : '없음'}
        </Text>
      </View>
      {/* 감정 선택 버튼들 */}
      <ScrollView 
        style={styles.emotionsContainer}
        contentContainerStyle={styles.emotionsContent}
        showsVerticalScrollIndicator={false}
      >
        {renderEmotionGrid()}
      </ScrollView>

      {/* 텍스트 입력 영역 */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, { color: '#FFFFFF' }]}
            value={customEmotion}
            onChangeText={onCustomEmotionChange}
            placeholder="직접 입력하기"
            placeholderTextColor={colors.text.tertiary}
            multiline={false}
            editable={true}
            autoComplete="off"
            textContentType="none"
            accessibilityLabel="감정 직접 입력"
            accessibilityHint="감정을 직접 입력하세요. 자동완성 기능이 비활성화되어 있습니다"
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
                onCustomEmotionChange(voiceCommittedRef.current);
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

export default EmotionSelectionStep;

