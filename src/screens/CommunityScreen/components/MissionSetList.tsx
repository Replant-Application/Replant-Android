/**
 * 미션세트 목록 컴포넌트
 * 투두 공유 탭에서 사용되는 미션세트 목록을 표시합니다.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigation';
import { MissionSetSimple } from '../../../api/todolistApi';
import { Loading, EmptyState } from '../../../components/ui';
import { colors } from '../../../utils/designTokens';
import { SCREEN_NAMES } from '../../../utils/constants';
import { styles } from './MissionSetList.styles';

interface MissionSetListProps {
  missionSets: MissionSetSimple[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  onCopyMissionSet: (missionSet: MissionSetSimple) => void;
  renderStars: (rating: number) => string;
  navigation: NavigationProp<RootStackParamList>;
}

const MissionSetList: React.FC<MissionSetListProps> = ({
  missionSets,
  loading,
  searchQuery,
  onSearchChange,
  onFilterPress,
  refreshing,
  onRefresh,
  onCopyMissionSet,
  renderStars,
  navigation,
}) => {
  return (
    <>
      {/* 검색창과 필터 버튼 */}
      <View style={styles.filterContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Image
              source={require('../../../assets/images/search.png')}
              style={styles.searchIcon}
              resizeMode="contain"
              accessibilityLabel="검색 아이콘"
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="투두리스트 검색..."
              placeholderTextColor={colors.text.tertiary}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="필터"
            accessibilityHint="투두 공유 필터 옵션 열기"
          >
            <Image
              source={require('../../../assets/images/filter.png')}
              style={styles.filterIcon}
              resizeMode="contain"
              accessibilityElementsHidden={true}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <Loading text="투두리스트를 불러오는 중..." />
      ) : (
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
          {missionSets.length === 0 ? (
            <EmptyState
              iconImage={require('../../../assets/images/notes.png')}
              title="공유된 투두리스트가 없어요"
              description="다른 사용자들의 투두리스트를 기다려주세요!"
            />
          ) : (
            <View style={styles.missionSetList}>
              {missionSets.map(missionSet => (
                <TouchableOpacity
                  key={missionSet.id}
                  style={styles.missionSetCard}
                  onPress={() => navigation.navigate(SCREEN_NAMES.MISSION_SET_DETAIL as any, { missionSetId: missionSet.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.missionSetCardHeader}>
                    <Text style={styles.missionSetTitle} numberOfLines={1}>
                      {missionSet.title}
                    </Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => onCopyMissionSet(missionSet)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.copyButtonText}>담기</Text>
                    </TouchableOpacity>
                  </View>

                  {missionSet.description && (
                    <Text style={styles.missionSetDescription} numberOfLines={2}>
                      {missionSet.description}
                    </Text>
                  )}

                  <View style={styles.missionSetMeta}>
                    <Text style={styles.metaText}>
                      by {missionSet.creatorNickname}
                    </Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>
                      {missionSet.missionCount}개 미션
                    </Text>
                  </View>

                  <View style={styles.missionSetFooter}>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.stars}>
                        {renderStars(missionSet.averageRating)}
                      </Text>
                      <Text style={styles.ratingText}>
                        {missionSet.averageRating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.addedCount}>
                      {missionSet.addedCount}명이 담음
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </>
  );
};

export default MissionSetList;
