/**
 * 휠 피커 컴포넌트 (갤럭시 스타일)
 * 시간 선택 등에 사용되는 스크롤 가능한 피커
 */

import React, { useState, useEffect, useRef } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const index = options.findIndex(opt => opt.value === value);
    return index >= 0 ? index : 0;
  });

  useEffect(() => {
    const index = options.findIndex(opt => opt.value === value);
    if (index >= 0 && index !== selectedIndex) {
      setSelectedIndex(index);
      scrollToIndex(index, false);
    }
  }, [value, options, selectedIndex]);

  const scrollToIndex = (index: number, animated: boolean = true) => {
    if (scrollViewRef.current) {
      const y = index * ITEM_HEIGHT;
      scrollViewRef.current.scrollTo({ y, animated });
    }
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      onSelect(options[clampedIndex].value);
    }
  };

  const handleScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    scrollToIndex(clampedIndex, true);
  };

  useEffect(() => {
    scrollToIndex(selectedIndex, false);
  }, []);

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
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
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
