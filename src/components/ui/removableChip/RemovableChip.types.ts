export interface RemovableChipProps {
  /** 칩에 표시할 라벨 */
  label: string;
  /** × 터치 시 호출 (필터 해제 등) */
  onRemove: () => void;
  /** 접근성 라벨 (선택) */
  accessibilityLabel?: string;
}
