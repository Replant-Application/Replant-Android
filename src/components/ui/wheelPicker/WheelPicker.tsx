/**
 * 휠 피커 (갤럭시 스타일)
 * - 시간 선택: ScrollView + 스냅, 스크롤 끝날 때만 onSelect
 * - 레이아웃: 상하 패딩 2*ITEM_HEIGHT, 선택 영역 = 뷰 세로 중앙 50px
 * - 스크롤↔인덱스: scrollY = index * ITEM_HEIGHT, index = round(scrollY / ITEM_HEIGHT)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { typography } from '../../../utils/designTokens';
import { styles } from './WheelPicker.styles';

const ITEM_HEIGHT = 50;
const VELOCITY_THRESHOLD = 0.5; // 이하면 가만히 둔 스크롤로 보고 EndDrag에서 바로 커밋

export interface WheelPickerOption {
  label: string;
  value: string | number;
}

export interface WheelPickerProps {
  value: string | number;
  options: WheelPickerOption[];
  onSelect: (value: string | number) => void;
  width?: number;
  accessibilityLabel?: string;
}

function getIndexFromOffset(y: number, count: number): number {
  const i = Math.round(y / ITEM_HEIGHT);
  return Math.max(0, Math.min(i, count - 1));
}

const WheelPicker: React.FC<WheelPickerProps> = ({ value, options, onSelect, width, accessibilityLabel }) => {
  const scrollRef = useRef<ScrollView>(null);
  const hasCommittedRef = useRef(false);

  const [selectedIndex, setSelectedIndex] = useState(() => {
    const i = options.findIndex((o) => o.value === value);
    return i >= 0 ? i : 0;
  });

  const scrollToIndex = useCallback((index: number, animated: boolean) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated });
    }
  }, []);

  // 외부 value 변경 시에만 위치 동기화 (프로그래매틱 스크롤 후 end 이벤트는 무시하기 위해 플래그)
  useEffect(() => {
    const i = options.findIndex((o) => o.value === value);
    if (i < 0) return;
    setSelectedIndex(i);
    hasCommittedRef.current = true;
    scrollToIndex(i, false);
  }, [value, options, scrollToIndex]);

  const doCommit = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const i = getIndexFromOffset(y, options.length);
      if (options.length === 0) return;
      setSelectedIndex(i);
      scrollToIndex(i, true);
      onSelect(options[i].value);
    },
    [options, onSelect, scrollToIndex]
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const i = getIndexFromOffset(y, options.length);
      setSelectedIndex((prev) => (i !== prev ? i : prev));
    },
    [options.length]
  );

  const onScrollBeginDrag = useCallback(() => {
    hasCommittedRef.current = false;
  }, []);

  const onScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const v = e.nativeEvent.velocity?.y ?? 0;
      if (Math.abs(v) >= VELOCITY_THRESHOLD) return; // 관성 있음 → onMomentumScrollEnd에서 처리
      if (hasCommittedRef.current) return;
      hasCommittedRef.current = true;
      doCommit(e);
    },
    [doCommit]
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (hasCommittedRef.current) return;
      hasCommittedRef.current = true;
      doCommit(e);
    },
    [doCommit]
  );

  const onItemPress = useCallback(
    (index: number) => {
      hasCommittedRef.current = true;
      scrollToIndex(index, true);
      setSelectedIndex(index);
      onSelect(options[index].value);
    },
    [options, onSelect, scrollToIndex]
  );

  const selectedOption = options[selectedIndex];
  const currentValue = selectedOption ? selectedOption.label : '';
  const pickerLabel = accessibilityLabel || '선택기';

  return (
    <View style={[styles.container, width != null && { width }]}>
      <View style={styles.selection} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        accessibilityLabel={pickerLabel}
        accessibilityRole="adjustable"
        accessibilityValue={{ text: currentValue }}
        accessibilityHint="위아래로 스와이프하여 선택하거나 항목을 탭하여 선택할 수 있습니다"
      >
        <View style={{ height: ITEM_HEIGHT * 2 }} />
        {options.map((opt, index) => {
          const d = Math.abs(index - selectedIndex);
          const opacity = d === 0 ? 1 : d === 1 ? 0.4 : 0.2;
          const scale = d === 0 ? 1 : 0.9;
          const fontSize = d === 0 ? typography.fontSize.xl : typography.fontSize.base;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[styles.item, { height: ITEM_HEIGHT, opacity, transform: [{ scale }] }]}
              onPress={() => onItemPress(index)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected: index === selectedIndex }}
              accessibilityHint={index === selectedIndex ? `${opt.label} 선택됨` : `${opt.label} 선택`}
            >
              <Text style={[styles.itemText, { fontSize }]} accessibilityElementsHidden={true}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
      </ScrollView>
    </View>
  );
};

export default WheelPicker;
