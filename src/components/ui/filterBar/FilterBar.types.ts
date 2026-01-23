export interface FilterItem {
  key: string;
  label: string;
}

export interface FilterBarProps {
  filters: FilterItem[];
  selectedFilter: string;
  onFilterChange: (key: string) => void;
  variant?: 'pill' | 'button';
  containerStyle?: any;
  style?: any;
}
