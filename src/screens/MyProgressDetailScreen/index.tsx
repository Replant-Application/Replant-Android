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
    displayedBadges,
    badgesLoading,
    currentPage,
    totalPages,
    onRefresh,
    handleBadgePress,
    handleNextPage,
    handlePrevPage,
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
            <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로 가기">
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityElementsHidden={true}
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
              <>
              <View style={styles.badgeGrid}>
                {displayedBadges.map((badge) => {
                  const missionTitle = badge.mission?.title || badge.customMission?.title || '미션';

                  return (
                    <TouchableOpacity
                      key={badge.id}
                      style={styles.badgeItem}
                      onPress={() => handleBadgePress(badge)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${missionTitle} 배지${badge.remainingDays !== undefined ? `, D-${badge.remainingDays}` : ''}`}
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

              {totalPages > 1 && (
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
                    onPress={handlePrevPage}
                    disabled={currentPage === 0}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="이전 페이지"
                  >
                    <Text style={[styles.pageButtonText, currentPage === 0 && styles.pageButtonTextDisabled]}>
                      이전
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.pageIndicatorText}>
                    {currentPage + 1} / {totalPages}
                  </Text>
                  <TouchableOpacity
                    style={[styles.pageButton, currentPage >= totalPages - 1 && styles.pageButtonDisabled]}
                    onPress={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="다음 페이지"
                  >
                    <Text style={[styles.pageButtonText, currentPage >= totalPages - 1 && styles.pageButtonTextDisabled]}>
                      다음
                    </Text>
                  </TouchableOpacity>
                </View>
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
