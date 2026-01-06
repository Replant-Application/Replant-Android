import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

export interface SettingsScreenProps {
  navigation?: NavigationProp<RootStackParamList>;
}

export interface SettingItemProps {
  icon: any;
  title: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

