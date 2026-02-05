import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface FilterOptionItem {
  key: string;
  label: string;
}

export interface FilterOptionSectionProps {
  /** 섹션 제목 (예: "게시글 종류", "정렬", "인증 상태") */
  title: string;
  /** 옵션 목록 */
  options: FilterOptionItem[];
  /** 현재 선택된 옵션의 key */
  selected: string;
  /** 옵션 선택 시 호출 */
  onSelect: (key: string) => void;
  /** 선택된 옵션 옆에 ✓ 표시 여부. 기본값 true */
  showCheckmark?: boolean;
  /** 제목에 추가 스타일 (예: marginTop) */
  sectionTitleStyle?: StyleProp<TextStyle>;
  /** 컨테이너에 추가 스타일 */
  containerStyle?: StyleProp<ViewStyle>;
}
