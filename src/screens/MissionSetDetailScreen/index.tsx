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
} from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { formatDateKorean } from '../../utils/dateUtils';
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
                  <View style={styles.missionTitleRow}>
                    <Text style={styles.missionTitle}>{mission.missionTitle}</Text>
                    {mission.isCompletedByCreator !== undefined && (
                      <View style={[
                        styles.creatorStatusBadge,
                        mission.isCompletedByCreator ? styles.creatorStatusCompleted : styles.creatorStatusIncomplete,
                      ]}>
                        <Text style={[
                          styles.creatorStatusText,
                          mission.isCompletedByCreator ? styles.creatorStatusTextCompleted : styles.creatorStatusTextIncomplete,
                        ]}>
                          {mission.isCompletedByCreator ? '완료' : '미완료'}
                        </Text>
                      </View>
                    )}
                  </View>
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
