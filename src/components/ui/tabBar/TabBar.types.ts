export interface TabItem {
  key: string;
  label: string;
  badge?: number;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'pill' | 'underline' | 'simple';
  containerStyle?: any;
  style?: any;
}
