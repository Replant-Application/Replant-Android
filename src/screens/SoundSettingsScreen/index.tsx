import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ImageBackground } from 'react-native';
import Slider from '@react-native-community/slider';
import { Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SoundSettingsScreenProps } from './SoundSettingsScreen.types';
import { saveSoundSettings, loadSoundSettings, getDefaultSoundSettings, SoundSettings } from '../../utils/soundSettings';
import { backgroundMusicService } from '../../services/backgroundMusicService';
import { playButtonSound } from '../../utils/soundUtils';

const SoundSettingsScreen: React.FC<SoundSettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<SoundSettings>(getDefaultSoundSettings());

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await loadSoundSettings();
    setSettings(loadedSettings);
    // 배경음악 서비스에 볼륨 적용
    await backgroundMusicService.setVolume(loadedSettings.backgroundVolume);
  };

  const handleEffectMuteToggle = async () => {
    await playButtonSound();
    const newVolume = settings.effectVolume === 0 ? 1.0 : 0;
    const newSettings = { ...settings, effectVolume: newVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
  };

  const handleBackgroundMuteToggle = async () => {
    await playButtonSound();
    const newVolume = settings.backgroundVolume === 0 ? 0.5 : 0;
    const newSettings = { ...settings, backgroundVolume: newVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
    await backgroundMusicService.setVolume(newVolume);
  };

  /**
   * 볼륨 값 검증 (0.0 ~ 1.0 범위)
   */
  const validateVolume = (volume: number): number => {
    if (volume < 0) return 0;
    if (volume > 1) return 1;
    return volume;
  };

  /**
   * 효과음 볼륨 변경 핸들러
   */
  const handleEffectVolumeChange = async (value: number) => {
    const validatedVolume = validateVolume(value);
    const newSettings = { ...settings, effectVolume: validatedVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
  };

  /**
   * 배경소리 볼륨 변경 핸들러
   */
  const handleBackgroundVolumeChange = async (value: number) => {
    const validatedVolume = validateVolume(value);
    const newSettings = { ...settings, backgroundVolume: validatedVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
    // 실시간으로 배경음악 볼륨 적용
    await backgroundMusicService.setVolume(validatedVolume);
  };

  const handleReset = async () => {
    const defaultSettings = getDefaultSoundSettings();
    setSettings(defaultSettings);
    await saveSoundSettings(defaultSettings);
    await backgroundMusicService.setVolume(defaultSettings.backgroundVolume);
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header 
        title="사운드 설정" 
        showBackButton={true}
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingsCard}>
          {/* 효과음 설정 */}
          <View style={styles.volumeSection}>
            <View style={styles.volumeRow}>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={handleEffectMuteToggle}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="효과음 음소거"
              >
                <Image
                  source={settings.effectVolume === 0 
                    ? require('../../assets/images/soundx.png')
                    : require('../../assets/images/sound.png')
                  }
                  style={styles.volumeIcon}
                  resizeMode="contain"
                  accessibilityElementsHidden={true}
                />
              </TouchableOpacity>
              <Text style={styles.volumeLabel}>효과음</Text>
              <Text style={styles.volumeValue}>{Math.round(settings.effectVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.effectVolume}
              onValueChange={handleEffectVolumeChange}
              minimumTrackTintColor={colors.primary[500]}
              maximumTrackTintColor={colors.border.light}
              thumbTintColor={colors.primary[500]}
              step={0.01}
              accessibilityLabel="효과음 볼륨 조절"
            />
          </View>

          <View style={styles.divider} />

          {/* 배경소리 설정 */}
          <View style={styles.volumeSection}>
            <View style={styles.volumeRow}>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={handleBackgroundMuteToggle}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="배경소리 음소거"
              >
                <Image
                  source={settings.backgroundVolume === 0 
                    ? require('../../assets/images/soundx.png')
                    : require('../../assets/images/sound.png')
                  }
                  style={styles.volumeIcon}
                  resizeMode="contain"
                  accessibilityElementsHidden={true}
                />
              </TouchableOpacity>
              <Text style={styles.volumeLabel}>배경소리</Text>
              <Text style={styles.volumeValue}>{Math.round(settings.backgroundVolume * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={settings.backgroundVolume}
              onValueChange={handleBackgroundVolumeChange}
              minimumTrackTintColor={colors.primary[500]}
              maximumTrackTintColor={colors.border.light}
              thumbTintColor={colors.primary[500]}
              step={0.01}
              accessibilityLabel="배경소리 볼륨 조절"
            />
          </View>
        </View>

        {/* 초기화 버튼 */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={async () => {
            await playButtonSound();
            await handleReset();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>기본값으로 초기화</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: 120,
  },
  settingsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  volumeSection: {
    paddingVertical: spacing[3],
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  volumeIcon: {
    width: 32,
    height: 32,
  },
  volumeLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  volumeValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    minWidth: 45,
    textAlign: 'right',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  slider: {
    width: '100%',
    height: 40,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[2],
  },
  resetButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  resetButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
});



export default SoundSettingsScreen;
