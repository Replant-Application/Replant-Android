/**
 * 나의 진행률 상세 화면
 * 유효한 배지 목록
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { useMyProgressDetailScreenContainer } from './MyProgressDetailScreen.container';
import { styles } from './MyProgressDetailScreen.styles';

interface MyProgressDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MyProgressDetailScreen: React.FC<MyProgressDetailScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    refreshing,
    validBadges,
    badgesLoading,
    onRefresh,
    handleBadgePress,
  } = useMyProgressDetailScreenContainer({ navigation });

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <View style={styles.container}>
        <Header
          title="배지"
          leftButton={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityLabel="뒤로 가기"
              />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        >
          {/* 유효한 배지 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>유효한 배지</Text>
              <Text style={styles.sectionCount}>{validBadges.length}개</Text>
            </View>

            {badgesLoading ? (
              <Loading text="배지를 불러오는 중..." />
            ) : validBadges.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/images/check2.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                  accessibilityLabel="배지 아이콘"
                />
                <Text style={styles.emptyText}>유효한 배지가 없습니다</Text>
                <Text style={styles.emptySubtext}>미션을 완료하고 배지를 획득해보세요!</Text>
              </View>
            ) : (
              <View style={styles.badgeGrid}>
                {validBadges.map((badge) => {
                  const missionTitle = badge.mission?.title || badge.customMission?.title || '미션';

                  return (
                    <TouchableOpacity
                      key={badge.id}
                      style={styles.badgeItem}
                      onPress={() => handleBadgePress(badge)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.badgeIcon}>
                        <Image
                          source={require('../../assets/images/check2.png')}
                          style={styles.badgeIconImage}
                          resizeMode="contain"
                          accessibilityLabel="배지 아이콘"
                        />
                      </View>
                      <Text style={styles.badgeTitle} numberOfLines={2}>
                        {missionTitle}
                      </Text>
                      {badge.remainingDays !== undefined && (
                        <Text style={styles.badgeRemaining}>D-{badge.remainingDays}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};


export default MyProgressDetailScreen;
