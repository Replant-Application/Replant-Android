import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SettingItemProps } from '../../types/screens/settings';
import { styles } from './SettingItem.styles';

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
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityHint={showArrow ? "설정 화면으로 이동" : undefined}
  >
    <View style={styles.settingItemLeft}>
      <Image source={icon} style={styles.settingIcon} resizeMode="contain" accessibilityElementsHidden={true} />
      <Text style={[
        styles.settingItemText, 
        danger && styles.settingItemTextDanger
      ]}>
        {title}
      </Text>
    </View>
    {showArrow && (
      <Image
        source={require('../../assets/images/left.png')}
        style={[styles.arrowIcon, { transform: [{ rotate: '180deg' }] }]}
        resizeMode="contain"
        accessibilityElementsHidden={true}
      />
    )}
  </TouchableOpacity>
);

export default SettingItem;

