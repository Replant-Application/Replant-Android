/**
 * Settings 관련 화면 타입 정의
 */

import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

export interface SoundSettingsScreenProps {
  navigation?: NavigationProp<RootStackParamList>;
}

export interface SettingsScreenProps {
  navigation?: NavigationProp<RootStackParamList>;
}

export interface SettingItemProps {
  icon: any;
  title: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
  isLast?: boolean; // 마지막 아이템 여부 (하단 경계선 제거용)
}
