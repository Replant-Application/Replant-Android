/**
 * 미션세트 상세 화면
 * 미션세트의 미션 목록 확인 및 담기 기능, 리뷰 기능
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, RatingSelector } from '../../components/ui';
import { useMissionSetDetailScreenContainer } from './MissionSetDetailScreen.container';
import { styles } from './MissionSetDetailScreen.styles';

interface MissionSetDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionSetDetail'>;
}

const MissionSetDetailScreen: React.FC<MissionSetDetailScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    missionSet,
    myReview,
    loading,
    reviewRating,
    submittingReview,
    showReviewForm,
    isOwner,
    setReviewRating,
    handleSubmitReview,
    handleOpenReviewForm,
    handleCloseReviewForm,
    renderStars,
  } = useMissionSetDetailScreenContainer({ navigation, route });

  if (loading) {
    return <Loading text="투두리스트를 불러오는 중..." />;
  }

  if (!missionSet) {
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <Header 
        title="투두리스트 상세" 
        showBackButton={true} 
        navigation={{
          ...navigation,
          goBack: () => {
            // returnScreen이 있으면 해당 화면으로 복원
            const returnScreen = route.params?.returnScreen;
            if (returnScreen) {
              const navParams: any = {};
              // Community로 돌아갈 때 activeTab 전달
              if (returnScreen === 'Community' && route.params?.activeTab) {
                navParams.activeTab = route.params.activeTab;
              }
              navigation.navigate(returnScreen as any, navParams);
            } else {
              // 기본 동작: 이전 화면으로 돌아가기
              navigation.goBack?.();
            }
          },
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 정보 */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>{missionSet.title}</Text>

          {missionSet.description && (
            <Text style={styles.description}>{missionSet.description}</Text>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.creator}>by {missionSet.creatorNickname}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.missionCount}>{missionSet.missionCount}개 미션</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.stars}>{renderStars(missionSet.averageRating || 0)}</Text>
              <Text style={styles.addedCount}>({missionSet.addedCount})</Text>
            </View>
          </View>
        </View>

        {/* 미션 목록 */}
        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>포함된 미션</Text>

          {missionSet.missions.length === 0 ? (
            <View style={styles.emptyMissions}>
              <Text style={styles.emptyText}>등록된 미션이 없습니다.</Text>
            </View>
          ) : (
            <View style={styles.missionList}>
              {missionSet.missions.map((mission, index) => (
                <View key={mission.missionId} style={styles.missionItem}>
                  <View style={styles.missionNumber}>
                    <Text style={styles.missionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.missionTitle}>{mission.missionTitle}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 리뷰 섹션 */}
        {!isOwner && (missionSet as any).isPublic && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>리뷰</Text>

            {showReviewForm ? (
              <View style={styles.reviewFormCard}>
                <Text style={styles.reviewFormLabel}>별점을 선택해주세요</Text>
                <RatingSelector rating={reviewRating} onRatingChange={setReviewRating} />
                <View style={styles.reviewFormButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCloseReviewForm}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, submittingReview && styles.submitButtonDisabled]}
                    onPress={handleSubmitReview}
                    disabled={submittingReview || !reviewRating}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.submitButtonText}>
                      {submittingReview 
                        ? (myReview && myReview.id ? '수정 중...' : '등록 중...')
                        : (myReview && myReview.id ? '수정' : '등록')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : myReview && myReview.rating ? (
              <TouchableOpacity
                style={styles.myReviewCard}
                onPress={() => {
                  console.log('[MissionSetDetail] My Review card pressed');
                  handleOpenReviewForm();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.myReviewHeader} pointerEvents="none">
                  <Text style={styles.myReviewLabel}>내 리뷰</Text>
                  <Text style={styles.myReviewStars}>{renderStars(myReview.rating)}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={handleOpenReviewForm}
                activeOpacity={0.7}
              >
                <Text style={styles.writeReviewButtonText}>리뷰 작성하기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 여백 */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </ImageBackground>
  );
};


export default MissionSetDetailScreen;
