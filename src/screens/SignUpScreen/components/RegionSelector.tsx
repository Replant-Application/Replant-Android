/**
 * 지역 선택 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { RegionInfo } from '../../../api/authApi';
import { REGIONS } from '../../../constants/screens/auth';
import { styles } from './RegionSelector.styles';

interface RegionSelectorProps {
  region: string | null;
  regionName: string;
  onRegionChange: (code: string, name: string) => void;
  showModal: boolean;
  onModalToggle: () => void;
  onOtherModalClose?: () => void;
  error?: string;
  onErrorClear?: () => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  region,
  regionName,
  onRegionChange,
  showModal,
  onModalToggle,
  onOtherModalClose,
  error,
  onErrorClear,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>지역</Text>
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
          !regionName && styles.dropdownPlaceholder,
        ]}>
          {regionName || '지역을 선택해주세요'}
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
            {REGIONS.map((item, index) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.dropdownListItem,
                  index === 0 && styles.dropdownListItemFirst,
                  region === item.code && styles.dropdownListItemSelected,
                ]}
                onPress={() => {
                  onRegionChange(item.code, item.name);
                  onModalToggle();
                  if (onErrorClear) {
                    onErrorClear();
                  }
                }}
              >
                <Text style={[
                  styles.dropdownListItemText,
                  region === item.code && styles.dropdownListItemTextSelected,
                ]}>
                  {item.name}
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

export default RegionSelector;
