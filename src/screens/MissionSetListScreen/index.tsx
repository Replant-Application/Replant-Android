/**
 * 투두리스트(미션세트) 공유 화면
 * 공개된 미션세트 목록 표시 및 공유 기능
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  ImageBackground,
  Modal,
  FlatList,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header, Loading, EmptyState } from '../../components/ui';
import { colors, spacing } from '../../utils/designTokens';
import { formatDateKorean } from '../../utils/dateUtils';
import { SCREEN_NAMES } from '../../utils/constants';
import { useMissionSetListScreenContainer } from './MissionSetListScreen.container';
import { styles } from './MissionSetListScreen.styles';

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
  } = useMissionSetListScreenContainer({ navigation });

  if (loading) {
    return <Loading text="투두리스트를 불러오는 중..." />;
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
          title="투두 공유"
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
              onPress={openShareModal}
              style={styles.shareButton}
              accessibilityRole="button"
              accessibilityLabel="투두리스트 공유"
            >
              <Image
                source={require('../../assets/images/pencil.png')}
                style={styles.shareButtonIcon}
                resizeMode="contain"
                accessibilityLabel="공유"
                accessibilityElementsHidden={true}
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
            accessibilityLabel="투두리스트 검색"
            accessibilityHint="검색어 입력"
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
                  onPress={() => navigation.navigate(SCREEN_NAMES.MISSION_SET_DETAIL as any, { missionSetId: todoList.id, returnScreen: 'MissionSetList' })}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${todoList.title}, BY ${todoList.creatorNickname}`}
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
                      BY {todoList.creatorNickname}
                    </Text>
                  </View>

                  {/* 카드 푸터 */}
                  <View style={styles.cardFooter}>
                    <View style={styles.statsRow}>
                      {todoList.createdAt && (
                        <Text style={styles.createdAtText}>
                          {formatDateKorean(todoList.createdAt)}
                        </Text>
                      )}
                      <View style={styles.statItem}>
                        <Image
                          source={require('../../assets/images/heart.png')}
                          style={styles.likeIcon}
                          resizeMode="contain"
                          accessibilityLabel="좋아요 아이콘"
                          accessibilityElementsHidden={true}
                        />
                        <Text style={styles.statText}>좋아요 {todoList.likeCount ?? 0}명</Text>
                      </View>
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
          animationType="fade"
          transparent={true}
          onRequestClose={closeShareModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} accessibilityRole="header">내 투두리스트 공유하기</Text>
                <TouchableOpacity onPress={closeShareModal} accessibilityRole="button" accessibilityLabel="닫기">
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
                  <Text style={styles.modalEmptySubText}>투두리스트를 먼저 만들어주세요.</Text>
                </View>
              ) : (
                <FlatList
                  data={myTodoLists}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleShare(item)}
                      accessibilityRole="button"
                      accessibilityLabel={item.title}
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
                          <View style={styles.modalItemInfoRow}>
                            {item.createdAt && (
                              <Text style={styles.modalItemMissionCount}>
                                {formatDateKorean(item.createdAt)}
                              </Text>
                            )}
                            {item.status === 'COMPLETED' && (
                              <View style={styles.completedBadge}>
                                <Text style={styles.completedBadgeText}>완료</Text>
                              </View>
                            )}
                          </View>
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

export default MissionSetListScreen;
