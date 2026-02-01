/**
 * 출생연도 선택 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getBirthYears } from '../../../constants/screens/auth';
import { styles } from './BirthYearSelector.styles';

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
        accessibilityRole="button"
        accessibilityLabel={birthYear ? `출생연도 ${birthYear}년` : '출생연도 선택'}
        accessibilityHint="탭하면 출생연도 목록이 열립니다"
      >
        <Text style={[
          styles.dropdownButtonText,
          !birthYear && styles.dropdownPlaceholder,
        ]}>
          {birthYear ? `${birthYear}년` : '출생연도를 선택해주세요'}
        </Text>
        <Text style={styles.dropdownArrow} accessibilityElementsHidden={true}>▼</Text>
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
                accessibilityRole="button"
                accessibilityLabel={`${item}년`}
                accessibilityState={{ selected: birthYear === item }}
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

export default BirthYearSelector;
