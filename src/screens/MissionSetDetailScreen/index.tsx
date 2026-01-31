/**
 * 미션세트 상세 화면
 * 미션세트의 미션 목록 확인 및 좋아요
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading } from '../../components/ui';
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
    isOwner,
    handleLike,
    handleUnlike,
  } = useMissionSetDetailScreenContainer({ navigation, route });

  if (loading) {
    return <Loading text="투두리스트를 불러오는 중..." />;
  }

  if (!missionSet) {
    return null;
  }

  const detail = missionSet as { isLiked?: boolean; likeCount?: number; isPublic?: boolean };
  const isLiked = detail.isLiked ?? false;
  const likeCount = detail.likeCount ?? 0;
  const isPublic = detail.isPublic ?? false;
  const canLike = !isOwner && isPublic;

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <View style={styles.likeContainer}>
              {canLike ? (
                <TouchableOpacity
                  onPress={isLiked ? handleUnlike : handleLike}
                  disabled={liking}
                  style={styles.likeButton}
                  accessibilityRole="button"
                  accessibilityLabel={isLiked ? '좋아요 취소' : '좋아요'}
                >
                  <Image
                    source={require('../../assets/images/heart.png')}
                    style={[styles.likeIcon, isLiked && styles.likeIconActive]}
                    resizeMode="contain"
                    accessibilityLabel="좋아요 아이콘"
                    accessibilityElementsHidden={true}
                  />
                </TouchableOpacity>
              ) : (
                <Image
                  source={require('../../assets/images/heart.png')}
                  style={styles.likeIcon}
                  resizeMode="contain"
                  accessibilityLabel="좋아요 아이콘"
                  accessibilityElementsHidden={true}
                />
              )}
              <Text style={styles.likeCount}>{likeCount}</Text>
            </View>
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

        <View style={styles.spacer} />
      </ScrollView>
    </ImageBackground>
  );
};

export default MissionSetDetailScreen;
