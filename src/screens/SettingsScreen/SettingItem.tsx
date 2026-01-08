import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { SettingItemProps } from './SettingsScreen.types';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  onPress, 
  showArrow = true,
  danger = false 
}) => (
  <TouchableOpacity
    style={[styles.settingItem, danger && styles.settingItemDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingItemLeft}>
      <Image source={icon} style={styles.settingIcon} resizeMode="contain" />
      <Text style={[
        styles.settingItemText, 
        danger && styles.settingItemTextDanger,
        title === '로그아웃' && styles.settingItemTextLogout
      ]}>
        {title}
      </Text>
    </View>
    {showArrow && (
      <Image
        source={require('../../assets/images/left.png')}
        style={[styles.arrowIcon, { transform: [{ rotate: '180deg' }] }]}
        resizeMode="contain"
      />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingItemDanger: {
    borderBottomColor: colors.red[50],
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 24,
    height: 24,
    marginRight: spacing[3],
  },
  settingItemText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  settingItemTextDanger: {
    color: colors.error,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  settingItemTextLogout: {
    color: colors.error[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  arrowIcon: {
    width: 16,
    height: 16,
    opacity: 0.5,
  },
});

export default SettingItem;

