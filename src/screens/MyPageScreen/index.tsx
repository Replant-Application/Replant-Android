import React from 'react';
import { View, Text, ScrollView, ImageBackground, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCharacter } from '../../hooks/useCharacter';
import { CharacterCard } from '../../components/specialized';
import { Loading, ErrorBoundary, Header } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { RootStackParamList } from '../../types/navigation';
import { styles } from './MyPageScreen.styles';

interface MyPageScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MyPageScreen: React.FC<MyPageScreenProps> = ({ navigation }) => {
  const { profile, loading, error } = useUserProfile();
  const { characters } = useCharacter();
  const currentCharacter = characters.length > 0 ? characters[0] : null;

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (loading || !profile) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
        accessibilityElementsHidden={true}
      >
        <ScrollView style={styles.scrollView}>
          <Header title="마이페이지" navigation={navigation} />
          <View style={styles.content}>
            <Loading text="프로필을 불러오는 중..." />
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }


  // 통계 데이터 - 각 항목별 목표치 설정
  const statsData = [
    { 
      label: '완료한 미션', 
      value: profile.stats.completedMissions, 
      max: 100, // 목표: 100개 미션 완료
      color: colors.primary[500] 
    },
    { 
      label: '총 경험치', 
      value: profile.stats.totalExperience, 
      max: 1000, // 목표: 1000 경험치 (레벨 10)
      displayValue: profile.stats.totalExperience.toLocaleString(), 
      color: colors.green[500] 
    },
    { 
      label: '작성한 다이어리', 
      value: profile.stats.diaryCount, 
      max: 30, // 목표: 30개 다이어리 작성
      color: colors.orange[500] 
    },
    { 
      label: '커뮤니티 게시글', 
      value: profile.stats.postCount, 
      max: 50, // 목표: 50개 게시글 작성
      color: colors.blue[500] 
    },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <ScrollView style={styles.scrollView}>
        <Header title="마이페이지" navigation={navigation} />
        <View style={styles.content}>
          {/* 캐릭터 섹션 */}
          {currentCharacter && (
            <View style={styles.characterCard}>
              <View style={styles.sectionHeader}>
                <Image
                  source={require('../../assets/images/clover.png')}
                  style={styles.sectionIcon}
                  resizeMode="contain"
                  accessibilityLabel="캐릭터 아이콘"
                />
                <Text style={styles.sectionTitle}>나의 캐릭터</Text>
              </View>
              <CharacterCard
                character={currentCharacter}
                onPress={() => {}}
                style={styles.characterCardInner}
              />
            </View>
          )}

          {/* 통계 섹션 */}
          <View style={styles.statsCard}>
            <View style={styles.sectionHeader}>
              <Image
                source={require('../../assets/images/search.png')}
                style={styles.sectionIcon}
                resizeMode="contain"
                accessibilityLabel="통계 아이콘"
              />
              <Text style={styles.sectionTitle}>통계</Text>
            </View>
            <View style={styles.statsContainer}>
              {statsData.map((stat, index) => {
                // 각 항목별 목표치 대비 진행률 계산 (최대 100%)
                const percentage = stat.max > 0 
                  ? Math.min((stat.value / stat.max) * 100, 100) 
                  : 0;
                return (
                  <View key={index} style={styles.statItem}>
                    <View style={styles.statHeader}>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <Text style={styles.statValue}>
                        {stat.displayValue || stat.value.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.barChartContainer}>
                      <View style={styles.barChartBackground}>
                        <View
                          style={[
                            styles.barChartFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: stat.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default MyPageScreen;
