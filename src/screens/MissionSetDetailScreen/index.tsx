/**
 * 미션세트 상세 화면
 * 미션세트의 미션 목록 확인 및 좋아요
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { formatDateKorean } from '../../utils/dateUtils';
import { Header } from '../../components/ui';
import { useMissionSetDetailScreenContainer } from './MissionSetDetailScreen.container';
import { styles } from './MissionSetDetailScreen.styles';

interface MissionSetDetailScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'MissionSetDetail'>;
}

const MissionSetDetailScreen: React.FC<MissionSetDetailScreenProps> = ({ navigation, route }) => {
  const {
    missionSet,
    loading,
    liking,
    handleLike,
    handleUnlike,
  } = useMissionSetDetailScreenContainer({ navigation, route });

  if (!missionSet && !loading) {
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
            const returnScreen = route.params?.returnScreen;
            if (returnScreen) {
              const navParams: any = {};
              if (returnScreen === 'Community' && route.params?.activeTab) {
                navParams.activeTab = route.params.activeTab;
              }
              navigation.navigate(returnScreen as any, navParams);
            } else {
              navigation.goBack?.();
            }
          },
        }}
      />

      {missionSet ? (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>{missionSet.title}</Text>

          {missionSet.description && (
            <Text style={styles.description}>{missionSet.description}</Text>
          )}

          <View style={styles.metaRow}>
            {missionSet.createdAt && (
              <Text style={styles.createdAt}>
                {formatDateKorean(missionSet.createdAt)}
              </Text>
            )}
            {missionSet.createdAt && missionSet.creatorNickname && (
              <Text style={styles.metaDot}> · </Text>
            )}
            {missionSet.creatorNickname && (
              <Text style={styles.creator}>BY {missionSet.creatorNickname}</Text>
            )}
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => (missionSet.isLiked ? handleUnlike() : handleLike())}
              disabled={liking}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={missionSet.isLiked ? '좋아요 취소' : '좋아요'}
              accessibilityState={{ disabled: liking }}
            >
              <View style={styles.likeContainer}>
                <Image
                  source={require('../../assets/images/heart.png')}
                  style={[styles.likeIcon, missionSet.isLiked && styles.likeIconActive]}
                  resizeMode="contain"
                  accessibilityLabel="좋아요"
                  accessibilityElementsHidden={true}
                />
                <Text style={[styles.likeCount, missionSet.isLiked && styles.likeCountActive]}>
                  {missionSet.likeCount ?? 0}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.missionSection}>
          <Text style={styles.sectionTitle}>포함된 미션</Text>

          {missionSet.missions.length === 0 ? (
            <View style={styles.emptyMissions}>
              <Text style={styles.emptyText}>등록된 미션이 없습니다.</Text>
            </View>
          ) : (
            <View style={styles.missionList}>
              {missionSet.missions.map((mission, index) => {
                const canNavigateToPost = mission.isCompletedByCreator === true && mission.verificationPostId != null;
                const content = (
                  <View style={styles.missionItem}>
                    <View style={styles.missionContent}>
                      <View style={styles.missionTitleBlock}>
                        <View style={styles.missionNumberPrefix}>
                          <Text style={styles.missionTitle}>{index + 1}.</Text>
                        </View>
                        <Text style={styles.missionTitleText} numberOfLines={1}>{mission.missionTitle}</Text>
                      </View>
                      <View style={styles.missionBadgesBelow}>
                        <View
                          style={[
                            styles.missionTypeBadge,
                            mission.missionType === 'CUSTOM' ? styles.missionTypeBadgeCustom : styles.missionTypeBadgeOfficial,
                          ]}
                        >
                          <Text style={[
                            styles.missionTypeBadgeText,
                            mission.missionType === 'CUSTOM' ? styles.missionTypeBadgeTextCustom : styles.missionTypeBadgeTextOfficial,
                          ]} numberOfLines={1}>
                            {mission.missionType === 'CUSTOM' ? '커스텀' : '공식'}
                          </Text>
                        </View>
                        {mission.isCompletedByCreator === true ? (
                          <View style={[styles.creatorStatusBadge, styles.creatorStatusCompleted]}>
                            <Text style={[styles.creatorStatusText, styles.creatorStatusTextCompleted]} numberOfLines={1}>
                              완료
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
                if (canNavigateToPost) {
                  return (
                    <Pressable
                      key={mission.missionId}
                      onPress={() => {
                        const nav = navigation as any;
                        if (typeof nav.openPostInModal === 'function') {
                          nav.openPostInModal(mission.verificationPostId!);
                        } else if (typeof nav.navigate === 'function') {
                          nav.navigate('CommunityPostDetail', {
                            postId: String(mission.verificationPostId),
                            returnScreen: route.params?.returnScreen ?? 'Community',
                            activeTab: route.params?.activeTab ?? 'todo-share',
                          });
                        }
                      }}
                      style={({ pressed }) => [{ width: '100%', opacity: pressed ? 0.7 : 1 }]}
                      hitSlop={{ top: 12, bottom: 12, left: 0, right: 0 }}
                    >
                      {content}
                    </Pressable>
                  );
                }
                return (
                  <Pressable
                    key={mission.missionId}
                    onPress={() => {}}
                    style={({ pressed }) => [{ width: '100%', opacity: pressed ? 0.7 : 1 }]}
                    hitSlop={{ top: 12, bottom: 12, left: 0, right: 0 }}
                  >
                    {content}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
      ) : null}
    </ImageBackground>
  );
};

export default MissionSetDetailScreen;
