/**
 * 미션 도감 상세 화면
 * 미션 정보와 리뷰를 표시 (API 연동)
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Loading, Header, EmptyState, ReviewCard } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useMissionDetailScreenContainer, getDifficultyLabel, getMissionTypeLabel } from './MissionDetailScreen.container';
import { styles } from './MissionDetailScreen.styles';

interface MissionDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionDetail'>;
}

const MissionDetailScreen: React.FC<MissionDetailScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    mission,
    reviews,
    loading,
    refreshing,
    currentPage,
    totalPages,
    totalReviews,
    hasBadge,
    hasWrittenReview,
    reviewContent,
    reviewRating,
    submittingReview,
    returnTab,
    setReviewContent,
    setReviewRating,
    handleSubmitReview,
    handleRefresh,
    loadMoreReviews,
    handleCompleteCustom,
    completingCustom,
  } = useMissionDetailScreenContainer({ navigation, route });


  if (loading) {
    return <Loading text="미션 정보를 불러오는 중..." />;
  }

  if (!mission) {
    return (
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
        accessibilityElementsHidden={true}
      >
        <Header
          title="미션 상세"
          showBackButton={true}
          navigation={{
            ...navigation,
            goBack: () => {
              // returnTab이 있으면 해당 탭으로 복원
              if (returnTab) {
                const navParams: any = { activeTab: returnTab };
                // returnTab이 'missionGroup'일 때만 missionGroupTab 전달
                if (returnTab === 'missionGroup' && route.params?.missionGroupTab) {
                  navParams.missionGroupTab = route.params.missionGroupTab;
                }
                // returnTab이 'myMission'일 때만 selectedFilter 전달
                if (returnTab === 'myMission' && route.params?.selectedFilter) {
                  navParams.selectedFilter = route.params.selectedFilter;
                }
                navigation.navigate('Mission', navParams);
              } else {
                navigation.goBack?.();
              }
            },
          }}
        />
        <EmptyState
          icon="📭"
          title="미션을 찾을 수 없습니다"
          description="해당 미션을 찾을 수 없습니다."
        />
      </ImageBackground>
    );
  }

  const difficulty = getDifficultyLabel(mission.difficultyLevel);

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header
          title="미션 상세"
          showBackButton={true}
          navigation={{
            ...navigation,
            goBack: () => {
              // returnTab이 있으면 해당 탭으로 복원
              if (returnTab) {
                const navParams: any = { activeTab: returnTab };
                // returnTab이 'missionGroup'일 때만 missionGroupTab 전달
                if (returnTab === 'missionGroup' && route.params?.missionGroupTab) {
                  navParams.missionGroupTab = route.params.missionGroupTab;
                }
                // returnTab이 'myMission'일 때만 selectedFilter 전달
                if (returnTab === 'myMission' && route.params?.selectedFilter) {
                  navParams.selectedFilter = route.params.selectedFilter;
                }
                navigation.navigate('Mission', navParams);
              } else {
                navigation.goBack?.();
              }
            },
          }}
        />

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* 미션 정보 */}
        <View style={styles.missionContainer}>
          <View style={styles.missionHeader}>
            <View style={styles.missionTitleContainer}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <View style={styles.missionMeta}>
                <Text style={styles.missionType}>
                  {getMissionTypeLabel(mission.missionType)}
                </Text>
                <View style={[styles.difficultyBadge, { backgroundColor: difficulty.color + '20' }]}>
                  <Text style={[styles.difficultyText, { color: difficulty.color }]}>
                    {difficulty.label}
                  </Text>
                </View>
                {mission.missionType !== 'CUSTOM' && (
                  <View style={styles.missionExpContainer}>
                    <Image
                      source={require('../../assets/images/sun.png')}
                      style={styles.sunIcon}
                      resizeMode="contain"
                      accessibilityLabel="경험치 아이콘"
                    />
                    <Text style={styles.missionExp}>{mission.expReward} EXP</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {mission.description && (
            <Text style={styles.missionDescription}>{mission.description}</Text>
          )}

          <View style={styles.missionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalReviews}</Text>
              <Text style={styles.statLabel}>후기</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mission.qnaCount || 0}</Text>
              <Text style={styles.statLabel}>Q&A</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mission.badgeDurationDays}일</Text>
              <Text style={styles.statLabel}>뱃지 유효기간</Text>
            </View>
          </View>

          {/* 인증 방식 표시 */}
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationLabel}>인증 방식</Text>
            <Text style={styles.verificationValue}>
              {mission.verificationType === 'GPS'
                ? 'GPS 위치 인증'
                : mission.verificationType === 'TIME'
                ? `시간 인증 (${mission.requiredMinutes}분)`
                : '커뮤니티 인증'}
            </Text>
          </View>

          {/* 커스텀 미션 완료 버튼 */}
          {mission.missionType === 'CUSTOM' && (
            <TouchableOpacity
              style={[styles.completeCustomButton, completingCustom && styles.completeCustomButtonDisabled]}
              onPress={handleCompleteCustom}
              disabled={completingCustom}
              activeOpacity={0.7}
            >
              {completingCustom ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.completeCustomButtonText}>완료하기</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 후기 작성 섹션 */}
        {/* 뱃지가 없는 경우 안내 메시지 */}
        {!hasBadge && (
          <View style={styles.noBadgeSection}>
            <Image
              source={require('../../assets/images/badge.png')}
              style={styles.noBadgeIcon}
              resizeMode="contain"
              accessibilityLabel="뱃지 아이콘"
            />
            <Text style={styles.noBadgeTitle}>후기 작성 안내</Text>
            <Text style={styles.noBadgeDescription}>
              이 미션을 완료하고 유효한 뱃지를 획득하면{'\n'}후기를 작성할 수 있습니다.
            </Text>
          </View>
        )}

        {/* 뱃지가 있고 이미 후기를 작성한 경우 */}
        {hasBadge && hasWrittenReview && (
          <View style={styles.alreadyWrittenSection}>
            <Text style={styles.alreadyWrittenIcon} />
            <Text style={styles.alreadyWrittenText}>
              이 뱃지로 후기를 이미 작성하셨습니다.{'\n'}
              다시 미션을 완료하면 새 후기를 작성할 수 있어요!
            </Text>
          </View>
        )}

        {/* 뱃지가 있고 후기를 작성하지 않은 경우 */}
        {hasBadge && !hasWrittenReview && (
          <View style={styles.writeReviewSection}>
            <Text style={styles.sectionTitle}>후기 작성</Text>
            <Text style={styles.writeReviewHint}>
              미션 뱃지를 보유하고 계시네요! 후기를 남겨주세요.
            </Text>
            {/* 별점 선택 */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>별점</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                    activeOpacity={0.7}
                    style={styles.starButton}
                  >
                    <Text style={styles.starText}>
                      {star <= reviewRating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingValue}>{reviewRating}점</Text>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="후기를 작성해주세요..."
              placeholderTextColor={colors.text.tertiary}
              value={reviewContent}
              onChangeText={setReviewContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.submitReviewButton,
                (!reviewContent.trim() || submittingReview) && styles.submitReviewButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={!reviewContent.trim() || submittingReview}
              activeOpacity={0.7}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitReviewButtonText}>후기 등록</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 리뷰 목록 */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>후기 ({totalReviews})</Text>

          {reviews.length === 0 ? (
            <EmptyState
              iconImage={require('../../assets/images/notes.png')}
              title="아직 후기가 없어요"
              description="첫 후기를 남겨보세요!"
            />
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}

              {currentPage < totalPages - 1 && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreReviews}
                >
                  <Text style={styles.loadMoreText}>더 보기</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};


export default MissionDetailScreen;
