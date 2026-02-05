import React, { useRef, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground, PanResponder } from 'react-native';
import { Header } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { SoundSettingsScreenProps } from '../../types/screens/settings';
import { useSoundSettingsScreenContainer } from './SoundSettingsScreen.container';
import { styles } from './SoundSettingsScreen.styles';

const SoundSettingsScreen: React.FC<SoundSettingsScreenProps> = ({ navigation }) => {
  const {
    settings,
    handleEffectMuteToggle,
    handleBackgroundMuteToggle,
    handleEffectVolumeChange,
    handleBackgroundVolumeChange,
    handleResetWithSound,
  } = useSoundSettingsScreenContainer();

  const effectSliderRef = useRef<View>(null);
  const backgroundSliderRef = useRef<View>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const updateVolumeFromTouch = (
    sliderRef: React.RefObject<View>,
    pageX: number,
    onValue: (v: number) => void
  ) => {
    if (!sliderRef.current || pageX == null || isNaN(pageX)) return;
    (sliderRef.current as any).measure((_x: number, _y: number, width: number, _height: number, sliderPageX: number) => {
      if (!isMountedRef.current || width === 0 || sliderPageX == null || isNaN(sliderPageX)) return;
      const touchX = pageX - sliderPageX;
      const raw = touchX / width;
      const value = Math.round(raw * 100) / 100;
      onValue(Math.max(0, Math.min(1, value)));
    });
  };

  const effectPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderGrant: (evt) => {
          const pageX = evt.nativeEvent?.pageX;
          if (pageX != null) updateVolumeFromTouch(effectSliderRef, pageX, handleEffectVolumeChange);
        },
        onPanResponderMove: (evt) => {
          const pageX = evt.nativeEvent?.pageX;
          if (pageX != null) updateVolumeFromTouch(effectSliderRef, pageX, handleEffectVolumeChange);
        },
        onPanResponderRelease: () => {},
      }),
    [handleEffectVolumeChange]
  );

  const backgroundPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderGrant: (evt) => {
          const pageX = evt.nativeEvent?.pageX;
          if (pageX != null) updateVolumeFromTouch(backgroundSliderRef, pageX, handleBackgroundVolumeChange);
        },
        onPanResponderMove: (evt) => {
          const pageX = evt.nativeEvent?.pageX;
          if (pageX != null) updateVolumeFromTouch(backgroundSliderRef, pageX, handleBackgroundVolumeChange);
        },
        onPanResponderRelease: () => {},
      }),
    [handleBackgroundVolumeChange]
  );

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
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
                  accessibilityLabel={settings.effectVolume === 0 ? "효과음 음소거 아이콘" : "효과음 아이콘"}
                  accessibilityElementsHidden={true}
                />
              </TouchableOpacity>
              <Text style={styles.volumeLabel}>효과음</Text>
              <Text style={styles.volumeValue}>{Math.round(settings.effectVolume * 100)} %</Text>
            </View>
            <View style={styles.sliderContainer}>
              <View
                ref={effectSliderRef}
                style={styles.sliderTrack}
                {...effectPanResponder.panHandlers}
                accessible={true}
                accessibilityRole="adjustable"
                accessibilityLabel="효과음 볼륨"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(settings.effectVolume * 100) }}
              >
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${settings.effectVolume * 100}%`, backgroundColor: colors.primary[500] },
                  ]}
                  accessibilityElementsHidden={true}
                />
                <View
                  style={[styles.sliderThumb, { left: `${settings.effectVolume * 100}%` }]}
                  accessibilityElementsHidden={true}
                />
              </View>
            </View>
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
                  accessibilityLabel={settings.backgroundVolume === 0 ? "배경소리 음소거 아이콘" : "배경소리 아이콘"}
                  accessibilityElementsHidden={true}
                />
              </TouchableOpacity>
              <Text style={styles.volumeLabel}>배경소리</Text>
              <Text style={styles.volumeValue}>{Math.round(settings.backgroundVolume * 100)} %</Text>
            </View>
            <View style={styles.sliderContainer}>
              <View
                ref={backgroundSliderRef}
                style={styles.sliderTrack}
                {...backgroundPanResponder.panHandlers}
                accessible={true}
                accessibilityRole="adjustable"
                accessibilityLabel="배경음 볼륨"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(settings.backgroundVolume * 100) }}
              >
                <View
                  style={[
                    styles.sliderFill,
                    { width: `${settings.backgroundVolume * 100}%`, backgroundColor: colors.primary[500] },
                  ]}
                  accessibilityElementsHidden={true}
                />
                <View
                  style={[styles.sliderThumb, { left: `${settings.backgroundVolume * 100}%` }]}
                  accessibilityElementsHidden={true}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 초기화 버튼 */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetWithSound}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="기본값으로 초기화"
        >
          <Text style={styles.resetButtonText}>기본값으로 초기화</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default SoundSettingsScreen;
