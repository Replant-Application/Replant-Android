export interface SimpleTabItem {
  key: string;
  label: string;
}

export interface SimpleTabBarProps {
  tabs: SimpleTabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: any;
}
