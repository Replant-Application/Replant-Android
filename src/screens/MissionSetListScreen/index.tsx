/**
 * 투두리스트(미션세트) 공유 화면
 * 공개된 미션세트 목록 표시 및 담기 기능
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

export default MissionSetListScreen;
