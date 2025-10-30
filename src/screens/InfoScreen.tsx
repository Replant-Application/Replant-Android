import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

interface InfoScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: {
    params: {
      title: string;
      content: string;
    };
  };
}

const InfoScreen: React.FC<InfoScreenProps> = ({ navigation, route }) => {
  const { title, content } = route.params || { title: '', content: '' };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.contentText}>{content}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    marginRight: spacing[3],
  },
  backButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[5],
  },
  contentText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    color: colors.text.primary,
    letterSpacing: 0.3,
    textAlign: 'left',
  },
});

export default InfoScreen;
