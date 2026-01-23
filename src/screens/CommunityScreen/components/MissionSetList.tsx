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
import { styles as missionSetListStyles } from './MissionSetList.styles';
import { styles as communityStyles } from '../CommunityScreen.styles';

interface MissionSetListProps {
  missionSets: MissionSetSimple[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
  refreshing: boolean;
  onRefresh: () => void;
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
  renderStars,
  navigation,
}) => {
  return (
    <>
      {/* 검색창과 필터 버튼 - 전체 게시판과 동일한 스타일 사용 */}
      <View style={communityStyles.filterContainer}>
        <View style={communityStyles.searchRow}>
          <View style={communityStyles.searchContainer}>
            <Image
              source={require('../../../assets/images/search.png')}
              style={communityStyles.searchIcon}
              resizeMode="contain"
              accessibilityElementsHidden={true}
            />
            <TextInput
              style={communityStyles.searchInput}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="투두리스트 검색..."
              placeholderTextColor={colors.text.tertiary}
              accessibilityLabel="투두리스트 검색"
              accessibilityHint="투두리스트를 검색하려면 입력하세요"
              allowFontScaling={true}
            />
          </View>
          <TouchableOpacity
            style={communityStyles.filterButton}
            onPress={onFilterPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="필터"
            accessibilityHint="투두 공유 필터 옵션 열기"
          >
            <Image
              source={require('../../../assets/images/filter.png')}
              style={communityStyles.filterIcon}
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
          style={missionSetListStyles.content}
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
            <View style={missionSetListStyles.missionSetList}>
              {missionSets.map(missionSet => (
                <TouchableOpacity
                  key={missionSet.id}
                  style={missionSetListStyles.missionSetCard}
                  onPress={() => navigation.navigate(SCREEN_NAMES.MISSION_SET_DETAIL as any, { missionSetId: missionSet.id, returnScreen: 'Community' })}
                  activeOpacity={0.7}
                >
                  <View style={missionSetListStyles.missionSetCardHeader}>
                    <Text style={missionSetListStyles.missionSetTitle} numberOfLines={1}>
                      {missionSet.title}
                    </Text>
                  </View>

                  {missionSet.description && (
                    <Text style={missionSetListStyles.missionSetDescription} numberOfLines={2}>
                      {missionSet.description}
                    </Text>
                  )}

                  <View style={missionSetListStyles.missionSetMeta}>
                    <Text style={missionSetListStyles.metaText}>
                      by {missionSet.creatorNickname}
                    </Text>
                    <Text style={missionSetListStyles.metaDot}>·</Text>
                    <Text style={missionSetListStyles.metaText}>
                      {missionSet.missionCount}개 미션
                    </Text>
                  </View>

                  <View style={missionSetListStyles.missionSetFooter}>
                    <View style={missionSetListStyles.ratingContainer}>
                      <Text style={missionSetListStyles.stars}>
                        {renderStars(missionSet.averageRating || 0)}
                      </Text>
                      <Text style={missionSetListStyles.ratingText}>
                        {(missionSet.averageRating || 0).toFixed(1)}
                      </Text>
                    </View>
                    <Text style={missionSetListStyles.addedCount}>
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
