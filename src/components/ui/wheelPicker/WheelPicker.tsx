/**
 * 휠 피커 컴포넌트 (갤럭시 스타일)
 * 시간 선택 등에 사용되는 스크롤 가능한 피커
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { typography } from '../../../utils/designTokens';
import { styles } from './WheelPicker.styles';

interface WheelPickerOption {
  label: string;
  value: string | number;
}

interface WheelPickerProps {
  value: string | number;
  options: WheelPickerOption[];
  onSelect: (value: string | number) => void;
  width?: number;
}

const ITEM_HEIGHT = 50;

const WheelPicker: React.FC<WheelPickerProps> = ({ value, options, onSelect, width }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const committedRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const index = options.findIndex(opt => opt.value === value);
    return index >= 0 ? index : 0;
  });

  const scrollToIndex = useCallback((index: number, animated: boolean = true) => {
    if (scrollViewRef.current) {
      const y = index * ITEM_HEIGHT;
      scrollViewRef.current.scrollTo({ y, animated });
    }
  }, []);

  // 값이 외부에서 바뀌었을 때만 스크롤 위치 동기화 (committedRef 건드리지 않음 → 사용자 스크롤 후 commit 막힘 방지)
  useEffect(() => {
    const index = options.findIndex(opt => opt.value === value);
    if (index >= 0 && index !== selectedIndex) {
      setSelectedIndex(index);
      scrollToIndex(index, false);
    }
  }, [value, options, selectedIndex, scrollToIndex]);

  // 스크롤 중: 선택 인덱스만 갱신 (onSelect 호출 X → 부모 리렌더/useEffect 연쇄 방지)
  const handleScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    setSelectedIndex((prev) => (clampedIndex !== prev ? clampedIndex : prev));
  }, [options.length]);

  // 스크롤이 완전히 끝났을 때만 스냅 + onSelect (한 제스처당 한 번만 실행)
  const commitScrollEnd = useCallback((event: any) => {
    if (committedRef.current || options.length === 0) return;
    committedRef.current = true;
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    scrollToIndex(clampedIndex, true);
    setSelectedIndex(clampedIndex);
    onSelect(options[clampedIndex].value);
  }, [options, onSelect, scrollToIndex]);

  const handleScrollBeginDrag = useCallback(() => {
    committedRef.current = false;
  }, []);

  // onScrollEndDrag에서 실행 직전에 committedRef 리셋 (onScrollBeginDrag 미동작 시 대비)
  const handleScrollEndDrag = useCallback((event: any) => {
    committedRef.current = false;
    commitScrollEnd(event);
  }, [commitScrollEnd]);

  return (
    <View style={[styles.container, width && { width }]}>
      {/* 선택 영역 표시 */}
      <View style={styles.selection} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={commitScrollEnd}
        scrollEventThrottle={16}
      >
        {/* 상단 패딩 */}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
        {options.map((option, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0.2;
          const scale = distance === 0 ? 1 : 0.9;
          const fontSize = distance === 0 ? typography.fontSize.xl : typography.fontSize.base;
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.item,
                { height: ITEM_HEIGHT, opacity, transform: [{ scale }] }
              ]}
              onPress={() => {
                committedRef.current = true; // 애니메이션 스크롤로 인한 commitScrollEnd 이중 실행 방지
                scrollToIndex(index, true);
                setSelectedIndex(index);
                onSelect(option.value);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.itemText, { fontSize }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* 하단 패딩 */}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
      </ScrollView>
    </View>
  );
};

export default WheelPicker;
