/**
 * 나의 진행률 상세 화면
 * 유효한 뱃지 목록 + 완료된 미션 리스트 (페이지네이션)
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
  Dimensions,
  FlatList,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading } from '../../components/ui';
import { colors, spacing } from '../../utils/designTokens';
import { Badge } from '../../api/badgeApi';
import { Mission } from '../../types';
import { useMyProgressDetailScreenContainer } from './MyProgressDetailScreen.container';
import { styles } from './MyProgressDetailScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MyProgressDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MyProgressDetailScreen: React.FC<MyProgressDetailScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    refreshing,
    validBadges,
    badgesLoading,
    completedMissions,
    missionsLoading,
    currentMissionPage,
    missionFlatListRef,
    totalMissionPages,
    missionPages,
    onRefresh,
    handleBadgePress,
    handleMissionPress,
    onMissionPageChange,
    goToMissionPage,
  } = useMyProgressDetailScreenContainer({ navigation });

  // 미션 페이지 렌더링
  const renderMissionPage = ({ item: pageMissions, index }: { item: Mission[]; index: number }) => (
    <View style={styles.pageContainer}>
      {pageMissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/images/goal.png')}
            style={styles.emptyIcon}
            resizeMode="contain"
            accessibilityLabel="미션 아이콘"
          />
          <Text style={styles.emptyText}>완료한 미션이 없습니다</Text>
          <Text style={styles.emptySubtext}>미션을 완료하면 여기에 표시됩니다!</Text>
        </View>
      ) : (
        <View style={styles.missionList}>
          {pageMissions.map((mission, idx) => (
            <TouchableOpacity
              key={`${mission.mission_id || mission.id}-${idx}`}
              style={styles.missionItem}
              onPress={() => handleMissionPress(mission)}
              activeOpacity={0.7}
            >
              <View style={styles.missionIconContainer}>
                <Text style={styles.missionEmoji}>{mission.emoji || '🎯'}</Text>
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle} numberOfLines={1}>
                  {mission.title}
                </Text>
                {mission.description && (
                  <Text style={styles.missionDescription} numberOfLines={1}>
                    {mission.description}
                  </Text>
                )}
              </View>
              <View style={styles.completedBadge}>
                <Image
                  source={require('../../assets/images/check2.png')}
                  style={styles.checkIcon}
                  resizeMode="contain"
                  accessibilityLabel="완료 아이콘"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="뱃지 & 완료 미션"
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
          {/* 유효한 뱃지 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>유효한 뱃지</Text>
              <Text style={styles.sectionCount}>{validBadges.length}개</Text>
            </View>

            {badgesLoading ? (
              <Loading text="뱃지를 불러오는 중..." />
            ) : validBadges.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/images/check2.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                  accessibilityLabel="뱃지 아이콘"
                />
                <Text style={styles.emptyText}>유효한 뱃지가 없습니다</Text>
                <Text style={styles.emptySubtext}>미션을 완료하고 뱃지를 획득해보세요!</Text>
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
                          accessibilityLabel="뱃지 아이콘"
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

          {/* 완료된 미션 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>완료한 미션</Text>
              <Text style={styles.sectionCount}>{completedMissions.length}개</Text>
            </View>

            {missionsLoading ? (
              <Loading text="미션을 불러오는 중..." />
            ) : completedMissions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/images/goal.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                  accessibilityLabel="미션 아이콘"
                />
                <Text style={styles.emptyText}>완료한 미션이 없습니다</Text>
                <Text style={styles.emptySubtext}>미션을 완료하면 여기에 표시됩니다!</Text>
              </View>
            ) : (
              <>
                <FlatList
                  ref={missionFlatListRef}
                  data={missionPages}
                  renderItem={renderMissionPage}
                  keyExtractor={(_, index) => `mission-page-${index}`}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onMissionPageChange}
                  getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH - spacing[8],
                    offset: (SCREEN_WIDTH - spacing[8]) * index,
                    index,
                  })}
                  scrollEnabled={totalMissionPages > 1}
                />

                {/* 페이지 인디케이터 및 네비게이션 */}
                {totalMissionPages > 1 && (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.pageArrow, currentMissionPage === 0 && styles.pageArrowDisabled]}
                      onPress={() => goToMissionPage(currentMissionPage - 1)}
                      disabled={currentMissionPage === 0}
                    >
                      <Text style={[styles.pageArrowText, currentMissionPage === 0 && styles.pageArrowTextDisabled]}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.pageIndicators}>
                      {missionPages.map((_, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.pageIndicator,
                            currentMissionPage === index && styles.pageIndicatorActive,
                          ]}
                          onPress={() => goToMissionPage(index)}
                        />
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[styles.pageArrow, currentMissionPage === totalMissionPages - 1 && styles.pageArrowDisabled]}
                      onPress={() => goToMissionPage(currentMissionPage + 1)}
                      disabled={currentMissionPage === totalMissionPages - 1}
                    >
                      <Text style={[styles.pageArrowText, currentMissionPage === totalMissionPages - 1 && styles.pageArrowTextDisabled]}>›</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 페이지 정보 */}
                {totalMissionPages > 1 && (
                  <Text style={styles.pageInfo}>
                    {currentMissionPage + 1} / {totalMissionPages} 페이지
                  </Text>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};


export default MyProgressDetailScreen;
