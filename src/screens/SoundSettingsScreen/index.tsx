import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import Slider from '@react-native-community/slider';
import { Header } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { SoundSettingsScreenProps } from '../../types/screens/settings';
import { useSoundSettingsScreenContainer } from './SoundSettingsScreen.container';
import { styles } from './SoundSettingsScreen.styles';

const SoundSettingsScreen: React.FC<SoundSettingsScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    settings,
    handleEffectMuteToggle,
    handleBackgroundMuteToggle,
    handleEffectVolumeChange,
    handleBackgroundVolumeChange,
    handleResetWithSound,
  } = useSoundSettingsScreenContainer();

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
              accessibilityRole="adjustable"
              accessibilityLabel="효과음 볼륨"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(settings.effectVolume * 100) }}
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
                  accessibilityLabel={settings.backgroundVolume === 0 ? "배경소리 음소거 아이콘" : "배경소리 아이콘"}
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
              accessibilityRole="adjustable"
              accessibilityLabel="배경음 볼륨"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(settings.backgroundVolume * 100) }}
            />
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
