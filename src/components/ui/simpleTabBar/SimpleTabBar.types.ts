export interface SimpleTabItem {
  key: string;
  label: string;
  count?: number; // 탭 아래에 표시할 숫자 (옵션)
}

export interface SimpleTabBarProps {
  tabs: SimpleTabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: any;
}
