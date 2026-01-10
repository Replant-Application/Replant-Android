import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ImageBackground, PanResponder, Dimensions } from 'react-native';
import { Header } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { SoundSettingsScreenProps } from './SoundSettingsScreen.types';
import { saveSoundSettings, loadSoundSettings, getDefaultSoundSettings, SoundSettings } from '../../utils/soundSettings';
import { backgroundMusicService } from '../../services/backgroundMusicService';
import { playButtonSound } from '../../utils/soundUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


// VolumeSlider 전용 스타일 (컴포넌트보다 먼저 정의)
const sliderStyles = StyleSheet.create({
  sliderContainer: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    width: "100%",
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
});

// 볼륨 슬라이더 컴포넌트 (SoundSettingsScreen 위에 정의)
const VolumeSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
}> = ({ value, onValueChange }) => {
  const sliderContainerRef = useRef<View>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (sliderContainerRef.current) {
        sliderContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
          if (!isMountedRef.current || width === 0) return;
          const touchX = evt.nativeEvent.pageX - pageX;
          const newValue = Math.max(0, Math.min(1, touchX / width));
          onValueChange(newValue);
        });
      }
    },
    onPanResponderMove: (evt) => {
      if (sliderContainerRef.current) {
        sliderContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
          if (!isMountedRef.current || width === 0) return;
          const touchX = evt.nativeEvent.pageX - pageX;
          const newValue = Math.max(0, Math.min(1, touchX / width));
          onValueChange(newValue);
        });
      }
    },
  }), [onValueChange]);

  return (
    <View style={sliderStyles.sliderContainer} ref={sliderContainerRef} {...panResponder.panHandlers}>
      <View style={sliderStyles.sliderTrack}>
        <View style={[sliderStyles.sliderFill, { width: `${value * 100}%` }]} />
      </View>
    </View>
  );
};

const SoundSettingsScreen: React.FC<SoundSettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<SoundSettings>(getDefaultSoundSettings());
  const [effectVolumeDragging, setEffectVolumeDragging] = useState(false);
  const [backgroundVolumeDragging, setBackgroundVolumeDragging] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await loadSoundSettings();
    setSettings(loadedSettings);
    // 배경음악 서비스에 볼륨 적용
    await backgroundMusicService.setVolume(loadedSettings.backgroundVolume);
  };

  const handleEffectVolumeChange = async (value: number) => {
    const newSettings = { ...settings, effectVolume: value };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
  };

  const handleBackgroundVolumeChange = async (value: number) => {
    const newSettings = { ...settings, backgroundVolume: value };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
    // 배경음악 서비스에 즉시 적용
    await backgroundMusicService.setVolume(value);
  };

  const handleEffectMuteToggle = async () => {
    await playButtonSound();
    const newVolume = settings.effectVolume === 0 ? 1.0 : 0;
    await handleEffectVolumeChange(newVolume);
  };

  const handleBackgroundMuteToggle = async () => {
    await playButtonSound();
    const newVolume = settings.backgroundVolume === 0 ? 0.5 : 0;
    const newSettings = { ...settings, backgroundVolume: newVolume };
    setSettings(newSettings);
    await saveSoundSettings(newSettings);
    await backgroundMusicService.setVolume(newVolume);
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
          <View style={styles.volumeRow}>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleEffectMuteToggle}
              activeOpacity={0.7}
            >
              <Image
                source={settings.effectVolume === 0 
                  ? require('../../assets/images/soundx.png')
                  : require('../../assets/images/sound.png')
                }
                style={styles.volumeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.sliderSection}>
              <Text style={styles.volumeLabel}>효과음</Text>
              <View style={styles.sliderWrapper}>
                <VolumeSlider
                  value={settings.effectVolume}
                  onValueChange={handleEffectVolumeChange}
                />
              </View>
            </View>
            <Text style={styles.volumeValue}>{Math.round(settings.effectVolume * 100)}%</Text>
          </View>

          <View style={styles.divider} />

          {/* 배경소리 설정 */}
          <View style={styles.volumeRow}>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleBackgroundMuteToggle}
              activeOpacity={0.7}
            >
              <Image
                source={settings.backgroundVolume === 0 
                  ? require('../../assets/images/soundx.png')
                  : require('../../assets/images/sound.png')
                }
                style={styles.volumeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.sliderSection}>
              <Text style={styles.volumeLabel}>배경소리</Text>
              <View style={styles.sliderWrapper}>
                <VolumeSlider
                  value={settings.backgroundVolume}
                  onValueChange={handleBackgroundVolumeChange}
                />
              </View>
            </View>
            <Text style={styles.volumeValue}>{Math.round(settings.backgroundVolume * 100)}%</Text>
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
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
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
  sliderSection: {
    flex: 1,
    marginHorizontal: spacing[2],
  },
  volumeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  sliderWrapper: {
    width: '100%',
  },
  volumeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'right',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[2],
  },
  sliderContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
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
