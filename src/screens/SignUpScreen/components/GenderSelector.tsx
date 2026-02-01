/**
 * 성별 선택 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Gender } from '../../../types/screens/auth';
import { styles } from './GenderSelector.styles';

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
          accessibilityRole="button"
          accessibilityLabel="남성"
          accessibilityState={{ selected: gender === 'MALE' }}
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
          accessibilityRole="button"
          accessibilityLabel="여성"
          accessibilityState={{ selected: gender === 'FEMALE' }}
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

export default GenderSelector;
