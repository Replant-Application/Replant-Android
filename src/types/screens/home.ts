/**
 * HomeScreen 타입 정의
 */

import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';

export interface HomeScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: {
    params?: {
      fromReantChat?: boolean;
    };
  };
}
