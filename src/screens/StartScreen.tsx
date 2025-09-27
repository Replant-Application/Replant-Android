import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SCREEN_NAMES } from '../utils/constants';
import { Button, Header } from '../components/ui';
import { colors, spacing, typography } from '../utils/designTokens';

interface StartScreenProps {
  onNavigate: (screen: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onNavigate }) => {

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate(SCREEN_NAMES.NICKNAME as string);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>🌱 Replant</Text>
        <Text style={styles.subtitle}>사회로의 첫 걸음</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="새로운 시작하기"
          onPress={handleGetStarted}
          size="lg"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    justifyContent: 'space-between',
    padding: spacing[5],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  subtitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  buttonContainer: {
    paddingBottom: spacing[10],
  },
  button: {
    width: '100%',
  },
});

export default StartScreen;
