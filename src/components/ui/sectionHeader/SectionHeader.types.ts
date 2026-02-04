import { ImageSourcePropType } from 'react-native';

export interface SectionHeaderProps {
  /** 섹션 제목 */
  title: string;
  /** 아이콘 이미지 소스 */
  iconSource: ImageSourcePropType;
  /** 아이콘 접근성 라벨 (선택) */
  accessibilityLabel?: string;
}
