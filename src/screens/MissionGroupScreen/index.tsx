/**
 * 미션 도감 화면
 * 모든 미션 목록 + 미션 상세 정보 + 후기 기능
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  Image,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, ErrorBoundary, EmptyState, SimpleTabBar } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import {
  useMissionGroupScreenContainer,
  UnifiedMission,
  getVerificationTypeLabel,
  getVerificationTypeIcon,
  getMissionCategoryLabel,
  getMissionIcon,
} from './MissionGroupScreen.container';
import { styles } from './MissionGroupScreen.styles';

interface MissionGroupScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MissionGroupScreen: React.FC<MissionGroupScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    missions,
    reviews,
    activeTab,
    selectedMission,
    loading,
    reviewsLoading,
    refreshing,
    error,
    currentPage,
    totalPages,
    hasMore,
    showReviewModal,
    reviewContent,
    submitting,
    setActiveTab,
    setReviewContent,
    handleMissionSelect,
    handleSubmitReview,
    handleOpenReviewModal,
    handleCloseReviewModal,
    handleCreateCustomMission,
    handleViewMissionDetail,
    onRefresh,
    loadMore,
  } = useMissionGroupScreenContainer({ navigation });



  if (loading) {
    return <Loading text="미션 도감을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="미션 도감"
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
          rightButton={
            activeTab === 'custom' ? (
              <TouchableOpacity
                onPress={handleCreateCustomMission}
                style={styles.createButton}
              >
                <Image
                  source={require('../../assets/images/pencil.png')}
                  style={styles.createButtonIcon}
                  resizeMode="contain"
                  accessibilityLabel="미션 생성"
                />
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* 공식미션 / 커스텀미션 탭 */}
        <View style={styles.tabContainer}>
          <SimpleTabBar
            tabs={[
              { key: 'official', label: '공식 미션' },
              { key: 'custom', label: '커스텀 미션' },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as 'official' | 'custom')}
            style={styles.tabBar}
          />
        </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {missions.length === 0 ? (
          <EmptyState
            iconImage={require('../../assets/images/goal.png')}
            title="미션이 없어요"
            description="현재 등록된 미션이 없습니다."
          />
        ) : (
          <>
            {/* 미션 목록 */}
            <View style={styles.missionListContainer}>
              <View style={styles.infoBox}>
                <Image
                  source={require('../../assets/images/RePlant_Logo.png')}
                  style={styles.logoIcon}
                  resizeMode="contain"
                  accessibilityLabel="RePlant 로고"
                />
                <Text style={styles.infoText}>
                  미션을 선택하면 상세 정보와 후기를 볼 수 있어요
                </Text>
              </View>

              {missions.map((mission) => (
                <View key={mission.id}>
                  <TouchableOpacity
                    style={[
                      styles.missionCard,
                      selectedMission?.id === mission.id && styles.missionCardSelected,
                    ]}
                    onPress={() => handleMissionSelect(mission)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.missionHeader}>
                      <View style={styles.missionInfo}>
                        <View style={styles.missionTitleRow}>
                          <Image
                            source={getMissionIcon(mission.title)}
                            style={styles.missionIcon}
                            resizeMode="contain"
                            accessibilityLabel={`${mission.title} 아이콘`}
                          />
                          <Text style={styles.missionTitle}>
                            {mission.isCompleted === false ? '?' : mission.title}
                          </Text>
                          {mission.category && (
                            <View style={styles.missionTypeBadge}>
                              <Text style={styles.missionTypeText}>
                                {getMissionCategoryLabel(mission.category)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.missionDescription} numberOfLines={2}>
                          {mission.isCompleted === false ? '?' : mission.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.missionContent}>
                      <View style={styles.missionVerificationInfo}>
                        {getVerificationTypeIcon(mission.verificationType) && (
                          <Image
                            source={getVerificationTypeIcon(mission.verificationType)!}
                            style={styles.verificationIcon}
                            resizeMode="contain"
                            accessibilityLabel={`${getVerificationTypeLabel(mission.verificationType)} 아이콘`}
                          />
                        )}
                        <Text style={styles.missionVerificationText}>
                          {getVerificationTypeLabel(mission.verificationType)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.missionFooter}>
                      <View style={styles.missionStats}>
                        {mission.expReward > 0 && (
                          <View style={styles.statItem}>
                            <Image
                              source={require('../../assets/images/sun.png')}
                              style={styles.statIcon}
                              resizeMode="contain"
                              accessibilityLabel="경험치 아이콘"
                            />
                            <Text style={styles.statText}>{mission.expReward} EXP</Text>
                          </View>
                        )}
                        <View style={styles.statItem}>
                          <Image
                            source={require('../../assets/images/high-five.png')}
                            style={styles.statIcon}
                            resizeMode="contain"
                            accessibilityLabel="참여자 아이콘"
                          />
                          <Text style={styles.statText}>
                            참여 {mission.participantCount || 0}명
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* 선택된 미션의 상세 정보를 해당 카드 바로 아래에 표시 */}
                  {selectedMission?.id === mission.id && (
                    <View style={styles.inlineDetailContainer}>
                      {/* 미션 상세 정보 */}
                      <View style={styles.inlineDetailCard}>
                        <Text style={styles.detailTitle}>미션 정보</Text>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>미션명</Text>
                          <Text style={styles.detailValue}>{selectedMission.title}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>설명</Text>
                          <Text style={styles.detailValue}>{selectedMission.description}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>인증 방식</Text>
                          <Text style={styles.detailValue}>
                            {getVerificationTypeLabel(selectedMission.verificationType)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>보상</Text>
                          <Text style={styles.detailValue}>
                            {selectedMission.isCustom 
                              ? `뱃지 (${selectedMission.badgeDurationDays}일)`
                              : `${selectedMission.expReward} EXP + 뱃지 (${selectedMission.badgeDurationDays}일)`
                            }
                          </Text>
                        </View>
                        {selectedMission.requiredMinutes && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>필요 시간</Text>
                            <Text style={styles.detailValue}>{selectedMission.requiredMinutes}분</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.detailButton}
                          onPress={() => handleViewMissionDetail(selectedMission)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.detailButtonText}>미션 상세 보기</Text>
                        </TouchableOpacity>
                      </View>

                      {/* 후기 섹션 - 주석처리 (미션 상세에서 뱃지 소유자만 작성 가능하도록 변경) */}
                      {/* <View style={styles.inlineReviewSection}>
                          <View style={styles.reviewSectionHeader}>
                            <Text style={styles.sectionTitle}>미션 후기</Text>
                            <TouchableOpacity
                              style={styles.writeReviewButton}
                              onPress={() => setShowReviewModal(true)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.writeReviewButtonText}>후기 작성</Text>
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.reviewHint}>
                            ※ 미션을 완료하고 뱃지를 획득해야 후기를 작성할 수 있습니다
                          </Text>

                          {reviewsLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="large" color={colors.primary[500]} />
                            </View>
                          ) : reviews.length === 0 ? (
                            <EmptyState
                              icon="📝"
                              title="아직 후기가 없어요"
                              description="첫 번째 후기를 남겨보세요!"
                            />
                          ) : (
                            <View style={styles.reviewList}>
                              {reviews.map((review) => (
                                <View key={review.id} style={styles.reviewCard}>
                                  <View style={styles.reviewHeader}>
                                    <View style={styles.reviewAvatar}>
                                      <Text style={styles.reviewAvatarText}>
                                        {review.userNickname.charAt(0).toUpperCase()}
                                      </Text>
                                    </View>
                                    <View style={styles.reviewAuthorInfo}>
                                      <Text style={styles.reviewAuthor}>{review.userNickname}</Text>
                                      <Text style={styles.reviewDate}>
                                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={styles.reviewContent}>{review.content}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View> */}
                      </View>
                  )}
                </View>
              ))}
            </View>

            {/* 페이지네이션: 더 보기 버튼 */}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
                activeOpacity={0.7}
              >
                <Text style={styles.loadMoreButtonText}>더 보기</Text>
              </TouchableOpacity>
            )}

            {/* 현재 페이지 정보 */}
            {totalPages > 1 && (
              <Text style={styles.pageInfo}>
                {currentPage + 1} / {totalPages} 페이지
              </Text>
            )}

          </>
        )}
      </ScrollView>

      {/* 후기 작성 모달 */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseReviewModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>후기 작성</Text>
              <TouchableOpacity
                onPress={handleCloseReviewModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMissionTitle}>
              {selectedMission?.title}
            </Text>

            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={5}
              placeholder="미션을 수행하면서 느낀 점, 팁 등을 공유해주세요..."
              placeholderTextColor={colors.text.tertiary}
              value={reviewContent}
              onChangeText={setReviewContent}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseReviewModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!reviewContent.trim() || submitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={!reviewContent.trim() || submitting}
                activeOpacity={0.7}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>등록</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </ImageBackground>
  );
};


export default MissionGroupScreen;
