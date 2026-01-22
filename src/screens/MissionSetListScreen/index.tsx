/**
 * 투두리스트(미션세트) 공유 화면
 * 공개된 미션세트 목록 표시 및 담기 기능
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Platform,
  ImageBackground,
  Modal,
  FlatList,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, EmptyState } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { SCREEN_NAMES } from '../../utils/constants';
import { useMissionSetListScreenContainer } from './MissionSetListScreen.container';

interface MissionSetListScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const MissionSetListScreen: React.FC<MissionSetListScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    publicTodoLists,
    loading,
    refreshing,
    searchQuery,
    shareModalVisible,
    myTodoLists,
    loadingMyTodoLists,
    handleSearchChange,
    onRefresh,
    openShareModal,
    closeShareModal,
    handleShare,
    handleCopy,
    renderStars,
  } = useMissionSetListScreenContainer({ navigation });

  if (loading) {
    return <Loading text="투두리스트를 불러오는 중..." />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title="투두 공유"
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
            <TouchableOpacity onPress={openShareModal} style={styles.shareButton}>
              <Image
                source={require('../../assets/images/pencil.png')}
                style={styles.shareButtonIcon}
                resizeMode="contain"
                accessibilityLabel="공유"
              />
            </TouchableOpacity>
          }
        />

        {/* 검색창 */}
        <View style={styles.searchContainer}>
          <Image
            source={require('../../assets/images/search.png')}
            accessibilityLabel="검색 아이콘"
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="투두리스트 검색..."
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

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
              다른 사용자의 투두리스트를 담아서 사용해보세요
            </Text>
          </View>

          {publicTodoLists.length === 0 ? (
            <EmptyState
              iconImage={require('../../assets/images/notes.png')}
              title="공유된 투두리스트가 없어요"
              description="다른 사용자들의 투두리스트를 기다려주세요!"
            />
          ) : (
            <View style={styles.missionSetList}>
              {publicTodoLists.map(todoList => (
                <TouchableOpacity
                  key={todoList.id}
                  style={styles.missionSetCard}
                  onPress={() => navigation.navigate(SCREEN_NAMES.MISSION_SET_DETAIL as any, { missionSetId: todoList.id })}
                  activeOpacity={0.7}
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
                        {todoList.title}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCopy(todoList);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.copyButtonText}>담기</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 설명 */}
                  {todoList.description && (
                    <Text style={styles.missionSetDescription} numberOfLines={2}>
                      {todoList.description}
                    </Text>
                  )}

                  {/* 작성자 정보 */}
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorText}>
                      by {todoList.creatorNickname}
                    </Text>
                  </View>

                  {/* 카드 푸터 */}
                  <View style={styles.cardFooter}>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Image
                          source={require('../../assets/images/goal.png')}
                          style={styles.statIcon}
                          resizeMode="contain"
                          accessibilityLabel="미션 아이콘"
                        />
                        <Text style={styles.statText}>{todoList.missionCount}개</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Image
                          source={require('../../assets/images/high-five.png')}
                          style={styles.statIcon}
                          resizeMode="contain"
                          accessibilityLabel="참여자 아이콘"
                        />
                        <Text style={styles.statText}>{todoList.addedCount}명</Text>
                      </View>
                    </View>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.stars}>
                        {renderStars(todoList.averageRating)}
                      </Text>
                      <Text style={styles.ratingText}>
                        {todoList.averageRating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 하단 여백 */}
          <View style={{ height: spacing[20] }} />
        </ScrollView>

        {/* 공유 모달 */}
        <Modal
          visible={shareModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeShareModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>내 투두리스트 공유하기</Text>
                <TouchableOpacity onPress={closeShareModal}>
                  <Text style={styles.modalCloseText}>닫기</Text>
                </TouchableOpacity>
              </View>

              {loadingMyTodoLists ? (
                <View style={styles.modalLoading}>
                  <Text style={styles.modalLoadingText}>불러오는 중...</Text>
                </View>
              ) : myTodoLists.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>공유할 수 있는 투두리스트가 없습니다.</Text>
                  <Text style={styles.modalEmptySubText}>비공개 투두리스트를 먼저 만들어주세요.</Text>
                </View>
              ) : (
                <FlatList
                  data={myTodoLists}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleShare(item)}
                    >
                      <View style={styles.modalItemContent}>
                        <Image
                          source={require('../../assets/images/notes.png')}
                          style={styles.modalItemIcon}
                          resizeMode="contain"
                          accessibilityLabel="투두리스트 아이콘"
                        />
                        <View style={styles.modalItemTextContainer}>
                          <Text style={styles.modalItemTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          {item.description && (
                            <Text style={styles.modalItemDescription} numberOfLines={1}>
                              {item.description}
                            </Text>
                          )}
                          <Text style={styles.modalItemMissionCount}>
                            {item.totalCount}개 미션
                          </Text>
                        </View>
                      </View>
                      <Image
                        source={require('../../assets/images/chevron.png')}
                        style={styles.modalItemArrow}
                        resizeMode="contain"
                        accessibilityLabel="화살표 아이콘"
                      />
                    </TouchableOpacity>
                  )}
                  style={styles.modalList}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  createButton: {
    padding: spacing[2],
  },
  createButtonIcon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
    tintColor: colors.text.tertiary,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    padding: 0,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[3],
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  missionSetList: {
    gap: spacing[2],
  },
  missionSetCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginRight: spacing[2],
  },
  cardIcon: {
    width: 20,
    height: 20,
  },
  missionSetTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  copyButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.base,
  },
  copyButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  missionSetDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  authorInfo: {
    marginBottom: spacing[2],
  },
  authorText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  stars: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xs),
  },
  shareButton: {
    padding: spacing[2],
  },
  shareButtonIcon: {
    width: 24,
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '70%',
    paddingBottom: spacing[6],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  modalCloseText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  modalLoading: {
    padding: spacing[8],
    alignItems: 'center',
  },
  modalLoadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  modalEmpty: {
    padding: spacing[8],
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    marginBottom: spacing[2],
  },
  modalEmptySubText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  modalList: {
    padding: spacing[4],
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  modalItemIcon: {
    width: 24,
    height: 24,
  },
  modalItemTextContainer: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    marginBottom: spacing[0.5],
  },
  modalItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    marginBottom: spacing[0.5],
  },
  modalItemMissionCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
  },
  modalItemArrow: {
    width: 16,
    height: 16,
    tintColor: colors.text.tertiary,
    marginLeft: spacing[2],
  },
});

export default MissionSetListScreen;
