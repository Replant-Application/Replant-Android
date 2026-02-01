/**
 * 내 미션세트 관리 화면
 * 내가 만든 미션세트 목록 관리
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ImageBackground,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, EmptyState } from '../../components/ui';
import { colors, spacing } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { useMyMissionSetsScreenContainer } from './MyMissionSetsScreen.container';
import { styles } from './MyMissionSetsScreen.styles';

interface MyMissionSetsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MyMissionSetsScreen: React.FC<MyMissionSetsScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    missionSets,
    loading,
    refreshing,
    onRefresh,
    handleDelete,
    handleDetail,
    handleCreate,
  } = useMyMissionSetsScreenContainer({ navigation });

  if (loading) {
    return <Loading text="내 투두리스트를 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <View style={styles.container}>
        <Header
          title="내 투두리스트"
          leftButton={
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
            >
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityLabel="뒤로 가기"
                accessibilityElementsHidden={true}
              />
            </TouchableOpacity>
          }
          rightButton={
            <TouchableOpacity
              onPress={handleCreate}
              style={styles.createButton}
              accessibilityRole="button"
              accessibilityLabel="새 투두리스트 만들기"
            >
              <Image
                source={require('../../assets/images/pencil.png')}
                style={styles.createButtonIcon}
                resizeMode="contain"
                accessibilityLabel="새 투두리스트 만들기"
                accessibilityElementsHidden={true}
              />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        >
          {/* 안내 박스 */}
          <View style={styles.infoBox}>
            <Image
              source={require('../../assets/images/notes.png')}
              style={styles.infoIcon}
              resizeMode="contain"
              accessibilityLabel="안내 아이콘"
            />
            <Text style={styles.infoText}>
              나만의 투두리스트를 만들고 관리해보세요
            </Text>
          </View>

          {missionSets.length === 0 ? (
            <EmptyState
              iconImage={require('../../assets/images/notes.png')}
              title="아직 투두리스트가 없어요"
              description="새로운 투두리스트를 만들어보세요!"
            />
          ) : (
            <View style={styles.missionSetList}>
              {missionSets.map(missionSet => (
                <TouchableOpacity
                  key={missionSet.id}
                  style={styles.missionSetCard}
                  onPress={() => handleDetail(missionSet)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${missionSet.title}`}
                >
                  {/* 카드 헤더 */}
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <Image
                        source={require('../../assets/images/notes.png')}
                        style={styles.cardIcon}
                        resizeMode="contain"
                        accessibilityLabel="투두리스트 아이콘"
                      />
                      <Text style={styles.missionSetTitle} numberOfLines={1}>
                        {missionSet.title}
                      </Text>
                      {missionSet.isPublic ? (
                        <View style={styles.publicBadge}>
                          <Text style={styles.publicBadgeText}>공개</Text>
                        </View>
                      ) : (
                        <View style={styles.privateBadge}>
                          <Text style={styles.privateBadgeText}>비공개</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(missionSet);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel="투두리스트 삭제"
                    >
                      <Image
                        source={require('../../assets/images/trash.png')}
                        style={styles.deleteIcon}
                        resizeMode="contain"
                        accessibilityLabel="삭제 아이콘"
                        accessibilityElementsHidden={true}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* 설명 */}
                  {missionSet.description && (
                    <Text style={styles.missionSetDescription} numberOfLines={2}>
                      {missionSet.description}
                    </Text>
                  )}

                  {/* 카드 푸터 */}
                  <View style={styles.cardFooter}>
                    {missionSet.createdAt && (
                      <Text style={styles.createdAtText}>
                        {formatDateKorean(missionSet.createdAt)}
                      </Text>
                    )}
                    {missionSet.isPublic && (
                      <View style={styles.likeContainer}>
                        <Image
                          source={require('../../assets/images/heart.png')}
                          style={styles.likeIcon}
                          resizeMode="contain"
                          accessibilityLabel="좋아요 아이콘"
                          accessibilityElementsHidden={true}
                        />
                        <Text style={styles.likeCount}>{missionSet.likeCount ?? 0}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 하단 여백 */}
          <View style={{ height: spacing[20] }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default MyMissionSetsScreen;
