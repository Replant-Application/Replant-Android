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
import { Loading, EmptyState, ConfirmModal } from '../../../components/ui';
import { colors } from '../../../utils/designTokens';
import { SCREEN_NAMES } from '../../../utils/constants';
import { formatDateKorean, normalizeDate, formatDateDivider } from '../../../utils/dateUtils';
import { useUser } from '../../../contexts/UserContext';
import { getCharacterImageStatic } from '../../../utils/characterUtils';
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
  navigation: NavigationProp<RootStackParamList>;
  /** 있으면 카드 클릭 시 이 콜백만 호출 (모달로 상세 표시용) */
  onMissionSetPress?: (missionSetId: number) => void;
  onUnshare?: (missionSetId: number) => Promise<void>;
  onTodoListLike?: (missionSetId: number, currentIsLiked: boolean) => Promise<void>;
  likingMissionSetId?: number | null;
}

const MissionSetList: React.FC<MissionSetListProps> = ({
  missionSets,
  loading,
  searchQuery,
  onSearchChange,
  onFilterPress,
  refreshing,
  onRefresh,
  navigation,
  onMissionSetPress,
  onUnshare,
  onTodoListLike,
  likingMissionSetId,
}) => {
  const { currentUserId } = useUser();
  const [showUnshareModal, setShowUnshareModal] = React.useState(false);
  const [selectedMissionSet, setSelectedMissionSet] = React.useState<MissionSetSimple | null>(null);
  const [_unsharing, setUnsharing] = React.useState(false);

  const handleUnsharePress = (missionSet: MissionSetSimple, e: any) => {
    e.stopPropagation();
    setSelectedMissionSet(missionSet);
    setShowUnshareModal(true);
  };

  const handleUnshareConfirm = async () => {
    if (!selectedMissionSet || !onUnshare) return;
    setUnsharing(true);
    try {
      await onUnshare(selectedMissionSet.id);
      setShowUnshareModal(false);
      setSelectedMissionSet(null);
    } finally {
      setUnsharing(false);
    }
  };

  const handleUnshareCancel = () => {
    setShowUnshareModal(false);
    setSelectedMissionSet(null);
  };

  /**
   * 날짜별로 미션세트 그룹화
   */
  const groupMissionSetsByDate = (sets: MissionSetSimple[]): Map<string, MissionSetSimple[]> => {
    const grouped = new Map<string, MissionSetSimple[]>();
    
    sets.forEach(missionSet => {
      if (!missionSet.createdAt) {
        // 날짜가 없는 경우 "기타" 그룹에 추가
        const key = '기타';
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(missionSet);
        return;
      }

      // 날짜 정규화 및 그룹 키 생성
      const normalizedDate = normalizeDate(missionSet.createdAt);
      if (!normalizedDate) {
        const key = '기타';
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(missionSet);
        return;
      }

      const date = new Date(normalizedDate);
      if (isNaN(date.getTime())) {
        const key = '기타';
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(missionSet);
        return;
      }

      // 날짜 구분선 포맷 사용 (오늘/어제/날짜)
      const dateKey = formatDateDivider(missionSet.createdAt);
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(missionSet);
    });

    // 각 그룹 내에서 최신순 정렬
    grouped.forEach((sets, key) => {
      sets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(normalizeDate(a.createdAt)).getTime() : 0;
        const dateB = b.createdAt ? new Date(normalizeDate(b.createdAt)).getTime() : 0;
        return dateB - dateA; // 최신순
      });
    });

    // 날짜별로 정렬 (최신순)
    const sortedGroups = new Map<string, MissionSetSimple[]>();
    
    // 날짜 키와 실제 날짜를 매핑하여 정렬
    const dateEntries = Array.from(grouped.entries()).map(([key, sets]) => {
      let sortDate = new Date(0); // 기본값: 가장 오래된 날짜
      
      if (key === '오늘') {
        sortDate = new Date();
      } else if (key === '어제') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        sortDate = yesterday;
      } else if (key === '기타') {
        sortDate = new Date(0); // 가장 오래된 날짜
      } else {
        // "YYYY년 M월 D일" 형식 파싱
        try {
          const match = key.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
          if (match) {
            const [, year, month, day] = match;
            sortDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
        } catch {
          // 파싱 실패 시 기본값 사용
        }
      }
      
      return { key, sets, sortDate };
    });

    // 날짜 기준으로 정렬 (최신순)
    dateEntries.sort((a, b) => {
      // 오늘 > 어제 > 다른 날짜 > 기타 순서
      if (a.key === '오늘' && b.key !== '오늘') return -1;
      if (b.key === '오늘' && a.key !== '오늘') return 1;
      if (a.key === '어제' && b.key !== '어제' && b.key !== '오늘') return -1;
      if (b.key === '어제' && a.key !== '어제' && a.key !== '오늘') return 1;
      if (a.key === '기타') return 1;
      if (b.key === '기타') return -1;
      
      return b.sortDate.getTime() - a.sortDate.getTime();
    });

    dateEntries.forEach(({ key, sets }) => {
      sortedGroups.set(key, sets);
    });

    return sortedGroups;
  };

  const groupedMissionSets = groupMissionSetsByDate(missionSets);

  return (
    <View style={missionSetListStyles.root}>
      {/* 검색창과 필터 버튼 - 전체 게시판과 동일한 스타일 사용 */}
      <View style={communityStyles.filterContainer}>
        <View style={communityStyles.searchRow}>
          <View style={communityStyles.searchContainer}>
            <Image
              source={require('../../../assets/images/search.png')}
              style={communityStyles.searchIcon}
              resizeMode="contain"
              accessibilityLabel="검색 아이콘"
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
              accessibilityLabel="필터 아이콘"
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
              {Array.from(groupedMissionSets.entries()).map(([dateKey, sets]) => (
                <View key={dateKey} style={missionSetListStyles.dateGroup}>
                  {/* 날짜 헤더 */}
                  <View style={missionSetListStyles.dateHeader}>
                    <Text style={missionSetListStyles.dateHeaderText}>{dateKey}</Text>
                  </View>
                  
                  {/* 해당 날짜의 미션세트 목록 */}
                  {sets.map(missionSet => {
                    const isOwner = currentUserId && missionSet.creatorId === currentUserId;
                    return (
                      <View key={missionSet.id} style={missionSetListStyles.cardWrapper}>
                        <TouchableOpacity
                          style={missionSetListStyles.missionSetCard}
                          onPress={() => {
                            if (onMissionSetPress) {
                              onMissionSetPress(missionSet.id);
                            } else {
                              const nav = (navigation as any).navigateNoHistory ?? navigation.navigate;
                              nav(SCREEN_NAMES.MISSION_SET_DETAIL, { missionSetId: missionSet.id, returnScreen: 'Community', activeTab: 'todo-share', fromCommunity: true });
                            }
                          }}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`${missionSet.title}, BY ${missionSet.creatorNickname}`}
                      >
                        {/* 제목, 이름 영역 */}
                        <View style={missionSetListStyles.missionSetHeader}>
                          <View style={missionSetListStyles.headerInfo}>
                            <Text style={missionSetListStyles.missionSetTitle} numberOfLines={2}>
                              {missionSet.title}
                            </Text>
                            {missionSet.creatorNickname && (
                              <View style={missionSetListStyles.nameBadge}>
                                <Text style={missionSetListStyles.nameBadgeText}>
                                  {missionSet.creatorNickname}
                                </Text>
                              </View>
                            )}
                          </View>
                          
                          {/* 삭제 버튼 (본인 게시글만) */}
                          {isOwner && onUnshare && (
                            <TouchableOpacity
                              style={missionSetListStyles.deleteButton}
                              onPress={(e) => handleUnsharePress(missionSet, e)}
                              activeOpacity={0.7}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                              accessibilityRole="button"
                              accessibilityLabel="투두리스트 공유 해제"
                            >
                              <Image
                                source={require('../../../assets/images/trash.png')}
                                style={missionSetListStyles.deleteIcon}
                                resizeMode="contain"
                                accessibilityElementsHidden={true}
                              />
                              <Text style={missionSetListStyles.deleteText}>삭제</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* 설명 */}
                        {missionSet.description && (
                          <Text style={missionSetListStyles.missionSetDescription} numberOfLines={2}>
                            {missionSet.description}
                          </Text>
                        )}

                        <View style={missionSetListStyles.missionSetFooter}>
                          {onTodoListLike ? (
                            <TouchableOpacity
                              style={missionSetListStyles.likeContainer}
                              onPress={() => {
                                if (likingMissionSetId !== missionSet.id) onTodoListLike(missionSet.id, !!missionSet.isLiked);
                              }}
                              disabled={likingMissionSetId === missionSet.id}
                              activeOpacity={0.7}
                              accessibilityRole="button"
                              accessibilityLabel={missionSet.isLiked ? '좋아요 취소' : '좋아요'}
                              accessibilityState={{ disabled: likingMissionSetId === missionSet.id }}
                            >
                              <Image
                                source={require('../../../assets/images/heart.png')}
                                style={[missionSetListStyles.likeIcon, missionSet.isLiked && missionSetListStyles.likeIconActive]}
                                resizeMode="contain"
                                accessibilityLabel="좋아요 아이콘"
                                accessibilityElementsHidden={true}
                              />
                              <Text style={[missionSetListStyles.likeCount, missionSet.isLiked && missionSetListStyles.likeCountActive]}>
                                {missionSet.likeCount ?? 0}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={missionSetListStyles.likeContainer}>
                              <Image
                                source={require('../../../assets/images/heart.png')}
                                style={[missionSetListStyles.likeIcon, missionSet.isLiked && missionSetListStyles.likeIconActive]}
                                resizeMode="contain"
                                accessibilityLabel="좋아요 아이콘"
                                accessibilityElementsHidden={true}
                              />
                              <Text style={[missionSetListStyles.likeCount, missionSet.isLiked && missionSetListStyles.likeCountActive]}>
                                {missionSet.likeCount ?? 0}
                              </Text>
                            </View>
                          )}
                        </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        visible={showUnshareModal}
        title="삭제"
        message={selectedMissionSet ? `"${selectedMissionSet.title}"를 공유 게시판에서 삭제하시겠습니까?` : ''}
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleUnshareConfirm}
        onCancel={handleUnshareCancel}
        confirmButtonColor={colors.error}
      />
    </View>
  );
};

export default MissionSetList;
