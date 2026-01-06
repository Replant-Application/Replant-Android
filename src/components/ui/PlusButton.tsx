import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../utils/designTokens';

interface PlusButtonProps {
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  plusColor?: string;
  style?: ViewStyle;
}

const PlusButton: React.FC<PlusButtonProps> = ({
  onPress,
  size = 16,
  backgroundColor = colors.primary[500],
  plusColor = colors.white,
  style,
}) => {
  const plusThickness = Math.max(1, size * 0.1);
  const plusLength = size * 0.4;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { width: size, height: size }, style]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: borderRadius.base,
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.plusContainer,
            {
              width: plusLength,
              height: plusLength,
            },
          ]}
        >
          {/* 가로 바 */}
          <View
            style={[
              styles.plusBar,
              {
                width: plusLength,
                height: plusThickness,
                backgroundColor: plusColor,
                borderRadius: plusThickness / 2,
              },
            ]}
          />
          {/* 세로 바 */}
          <View
            style={[
              styles.plusBar,
              styles.plusBarVertical,
              {
                width: plusThickness,
                height: plusLength,
                backgroundColor: plusColor,
                borderRadius: plusThickness / 2,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plusBar: {
    position: 'absolute',
  },
  plusBarVertical: {
    position: 'absolute',
  },
});

export default PlusButton;

