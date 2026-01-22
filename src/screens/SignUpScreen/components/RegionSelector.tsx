/**
 * 지역 선택 컴포넌트
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../../utils/designTokens';
import { getOptimizedLineHeight } from '../../../utils/textStyles';
import { RegionInfo } from '../../../api/authApi';
import { REGIONS } from '../../../constants/screens/auth';

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
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dropdownPlaceholder: {
    color: colors.text.tertiary,
  },
  dropdownArrow: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginTop: spacing[1],
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownListItem: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  dropdownListItemFirst: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  dropdownListItemSelected: {
    backgroundColor: colors.primary[50],
  },
  dropdownListItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  dropdownListItemTextSelected: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.medium,
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

export default RegionSelector;
