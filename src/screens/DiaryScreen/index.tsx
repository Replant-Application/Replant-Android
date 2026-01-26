import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  ImageBackground,
  Image,
  FlatList,
  RefreshControl,
  Animated
} from 'react-native';
import { Loading, ErrorBoundary, ConfirmModal, AlertModal } from '../../components/ui';
import { colors } from '../../utils/designTokens';
import { formatDateKorean, formatDateDivider } from '../../utils/dateUtils';
import { getCharacterImage } from '../../utils/characterUtils';
import EmotionSelectionStep from './EmotionSelectionStep';
import FactorSelectionStep from './FactorSelectionStep';
import { useDiaryScreenContainer } from './DiaryScreen.container';
import { styles } from './DiaryScreen.styles';

const DiaryScreen: React.FC = () => {
  // 비즈니스 로직은 Container에서 처리
  const {
    diaries,
    loading,
    error,
    currentCharacter,
    filteredDiaries,
    groupedDiaries,
    currentStep,
    moodValue,
    selectedEmotions,
    selectedFactors,
    factorText,
    emotionText,
    expressionText,
    selectedDiary,
    viewingDiaryIndex,
    viewMode,
    searchDate,
    refreshing,
    searchingByDate,
    showDeleteConfirm,
    showAlert,
    alertTitle,
    alertMessage,
    speechBubbleAnim,
    sliderRef,
    panResponder,
    handleNext,
    handleBack,
    toggleEmotion,
    toggleFactor,
    handleViewDiaries,
    handleViewDetail,
    handleDeleteDiary,
    confirmDeleteDiary,
    handleSearchByDate,
    handleStartWriting,
    handleDeleteCancel,
    handleAlertClose,
    handleSearchDateClear,
    handleBookDetailView,
    onRefresh,
    setFactorText,
    setEmotionText,
    setExpressionText,
    setViewMode,
    setSearchDate,
    setViewingDiaryIndex,
    getMoodColor,
    getStepMessage,
  } = useDiaryScreenContainer();

  if (loading) {
    return <Loading text="일기를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // 일기 상세 보기
  if (currentStep === 'detail' && selectedDiary) {
    return (
      <ImageBackground
        source={require('../../assets/images/night.png')}
        style={styles.container}
        resizeMode="cover"
        accessibilityElementsHidden={true}
      >
        <View style={styles.detailContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../../assets/images/left.png')}
              style={styles.backButtonIcon}
              resizeMode="contain"
              accessibilityLabel="뒤로 가기"
            />
          </TouchableOpacity>
          
          <ScrollView 
            style={styles.signboardScrollView}
            contentContainerStyle={styles.signboardScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.signboardContainer}>
              <View style={styles.signboard}>
                <View style={styles.signboardPaper}>
                  {/* 작성일 */}
                  <Text style={styles.signboardTitle}>작성일</Text>
                  <Text style={styles.signboardContent}>
                    {formatDateKorean(selectedDiary.date, true)}
                  </Text>
                  
                  {/* 기분 점수 */}
                  <Text style={styles.signboardTitle}>기분 점수</Text>
                  <Text style={styles.signboardContent}>
                    {selectedDiary.mood !== undefined ? `${selectedDiary.mood}점` : '없음'}
                  </Text>
                  
                  {/* 감정 */}
                  <Text style={styles.signboardTitle}>감정</Text>
                  {selectedDiary.emotions && selectedDiary.emotions.length > 0 ? (
                    <View style={styles.emotionsList}>
                      {selectedDiary.emotions.map((emotion, idx) => (
                        <View key={idx} style={styles.detailEmotionTag}>
                          <Text style={styles.detailEmotionTagText}>{emotion}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.signboardContent}>
                      {selectedDiary.emotion ? 
                        (selectedDiary.emotion === 'happy' ? '행복' :
                         selectedDiary.emotion === 'sad' ? '슬픔' :
                         selectedDiary.emotion === 'angry' ? '화남' :
                         selectedDiary.emotion === 'anxious' ? '불안' :
                         selectedDiary.emotion === 'tired' ? '피곤' :
                         selectedDiary.emotion === 'excited' ? '신남' :
                         selectedDiary.emotion === 'calm' ? '평온' :
                         selectedDiary.emotion === 'grateful' ? '감사' : selectedDiary.emotion) 
                        : '없음'}
                    </Text>
                  )}
                  
                  {/* 감정 요인 */}
                  <Text style={styles.signboardTitle}>감정 요인</Text>
                  {selectedDiary.emotionFactors && selectedDiary.emotionFactors.length > 0 ? (
                    <View style={styles.factorsList}>
                      {selectedDiary.emotionFactors.map((factor, idx) => (
                        <View key={idx} style={styles.factorTag}>
                          <Text style={styles.factorTagText}>{factor}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.signboardContent}>없음</Text>
                  )}
                  
                  {/* 감정 표현 (내용) */}
                  <Text style={styles.signboardTitle}>감정 표현</Text>
                  <Text style={styles.signboardContentText}>
                    {selectedDiary.content || '없음'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* 버튼을 ScrollView 안으로 이동 */}
            <View style={styles.detailButtons}>
              <TouchableOpacity 
                style={styles.backToListButton}
                onPress={handleBack}
              >
                <Text style={styles.backToListButtonText}>목록으로</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteDiary(selectedDiary.id)}
              >
                <Text style={styles.deleteButtonText}>삭제하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* 모달 컴포넌트 */}
        <ConfirmModal
          visible={showDeleteConfirm}
          title="일기 삭제"
          message="정말로 이 일기를 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={confirmDeleteDiary}
          onCancel={handleDeleteCancel}
          confirmButtonColor={colors.error}
        />
        <AlertModal
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={handleAlertClose}
        />
      </ImageBackground>
    );
  }

  // 일기 보기 모드
  if (currentStep === 'view') {
    return (
      <ImageBackground
        source={require('../../assets/images/night.png')}
        style={styles.container}
        resizeMode="cover"
        accessibilityElementsHidden={true}
      >
        <View style={styles.viewContainer}>
          <View style={styles.viewHeader}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityLabel="뒤로 가기"
              />
            </TouchableOpacity>
            
            {/* 뷰 모드 전환 버튼 */}
            <View style={styles.viewModeButtons}>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <Text style={[styles.viewModeButtonText, viewMode === 'list' && styles.viewModeButtonTextActive]}>
                  목록
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'book' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('book')}
              >
                <Text style={[styles.viewModeButtonText, viewMode === 'book' && styles.viewModeButtonTextActive]}>
                  책
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 목록 뷰 */}
          {viewMode === 'list' ? (
            <>
              {/* 날짜 검색 바 */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="날짜 입력 (YYYY-MM-DD)"
                    placeholderTextColor={colors.text.tertiary}
                    value={searchDate}
                    onChangeText={setSearchDate}
                    keyboardType="numeric"
                    maxLength={10}
                    accessibilityLabel="날짜 검색"
                    accessibilityHint="YYYY-MM-DD 형식으로 날짜를 입력하세요"
                  />
                  {searchDate.length > 0 && (
                    <TouchableOpacity
                      style={styles.searchClearButton}
                      onPress={handleSearchDateClear}
                    >
                      <Text style={styles.searchClearText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.searchButton, !searchDate.trim() && styles.searchButtonDisabled]}
                  onPress={() => handleSearchByDate(searchDate)}
                  disabled={searchingByDate || !searchDate.trim()}
                >
                  <Text style={styles.searchButtonText}>조회</Text>
                </TouchableOpacity>
              </View>

              {/* 일기 목록 */}
              {filteredDiaries.length > 0 ? (
                <FlatList
                  data={groupedDiaries}
                  keyExtractor={(item) => item.date}
                  renderItem={({ item }) => (
                    <View style={styles.dateGroup}>
                      <Text style={styles.dateGroupTitle}>
                        {formatDateDivider(item.date)}
                      </Text>
                      {item.diaries.map((diary) => (
                        <TouchableOpacity
                          key={diary.id}
                          style={styles.diaryListItem}
                          onPress={() => handleViewDetail(diary)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.diaryListItemContent}>
                            <View style={styles.diaryListItemHeader}>
                              <Text style={styles.diaryListItemEmotion}>
                                {diary.emotion === 'happy' ? '😊' :
                                 diary.emotion === 'sad' ? '😢' :
                                 diary.emotion === 'angry' ? '😠' :
                                 diary.emotion === 'anxious' ? '😰' :
                                 diary.emotion === 'tired' ? '😴' :
                                 diary.emotion === 'excited' ? '🤩' :
                                 diary.emotion === 'calm' ? '😌' :
                                 diary.emotion === 'grateful' ? '🙏' : '😊'}
                              </Text>
                              <Text style={styles.diaryListItemDate}>
                                {formatDateKorean(item.date)}
                              </Text>
                            </View>
                            <Text 
                              style={styles.diaryListItemText}
                              numberOfLines={2}
                            >
                              {diary.content}
                            </Text>
                            {(diary as any).emotions && (diary as any).emotions.length > 0 && (
                              <View style={styles.diaryListItemTags}>
                                {(diary as any).emotions.slice(0, 3).map((emotion: string, idx: number) => (
                                  <View key={idx} style={styles.diaryListItemTag}>
                                    <Text style={styles.diaryListItemTagText}>{emotion}</Text>
                                  </View>
                                ))}
                                {(diary as any).emotions.length > 3 && (
                                  <Text style={styles.diaryListItemTagMore}>
                                    +{(diary as any).emotions.length - 3}
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  contentContainerStyle={styles.listContent}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={colors.white}
                      colors={[colors.primary[500]]}
                    />
                  }
                  ListEmptyComponent={
                    <View style={styles.emptyView}>
                      <Text style={styles.emptyText}>
                        작성된 일기가 없습니다
                      </Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.emptyView}>
                  <Text style={styles.emptyText}>
                    작성된 일기가 없습니다
                  </Text>
                </View>
              )}
            </>
          ) : (
            /* 책 형태 뷰 */
            <>
              {diaries.length > 0 ? (
                <>
                  <View style={styles.topSection}>
                    <TouchableOpacity
                      style={styles.bookContainer}
                      onPress={() => handleBookDetailView(diaries[viewingDiaryIndex])}
                      activeOpacity={0.8}
                    >
                      <View style={styles.paperContainer}>
                        <Image
                          source={require('../../assets/images/paper.png')}
                          style={styles.paperImage}
                          resizeMode="contain"
                          accessibilityLabel="종이 아이콘"
                        />
                        <View style={styles.paperTextOverlay}>
                          <Text style={styles.paperDate}>
                            {`${diaries[viewingDiaryIndex]?.date || ''}\n작성한 감정 일기`}
                          </Text>
                        </View>
                      </View>
                      <Image
                        source={require('../../assets/images/book.png')}
                        style={styles.bookImage}
                        resizeMode="contain"
                        accessibilityLabel="책 아이콘"
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* 이전/다음 버튼 */}
                  {diaries.length > 1 && (
                    <View style={styles.bookNavigation}>
                      <TouchableOpacity
                        style={[styles.navButton, viewingDiaryIndex === 0 && styles.navButtonDisabled]}
                        onPress={() => setViewingDiaryIndex(Math.max(0, viewingDiaryIndex - 1))}
                        disabled={viewingDiaryIndex === 0}
                      >
                        <Text style={styles.navButtonText}>← 다음</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.navButton, viewingDiaryIndex >= diaries.length - 1 && styles.navButtonDisabled]}
                        onPress={() => setViewingDiaryIndex(Math.min(diaries.length - 1, viewingDiaryIndex + 1))}
                        disabled={viewingDiaryIndex >= diaries.length - 1}
                      >
                        <Text style={styles.navButtonText}>이전 →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.emptyView}>
                  <Text style={styles.emptyText}>작성된 일기가 없습니다</Text>
                </View>
              )}

              {currentCharacter && (
                <View style={styles.characterContainer}>
                  <Image
                    source={getCharacterImage(currentCharacter.level || 1, 'default')}
                    style={styles.characterImage}
                    resizeMode="contain"
                    accessibilityLabel={`${currentCharacter.name || '캐릭터'} 이미지`}
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* 모달 컴포넌트 */}
        <ConfirmModal
          visible={showDeleteConfirm}
          title="일기 삭제"
          message="정말로 이 일기를 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={confirmDeleteDiary}
          onCancel={handleDeleteCancel}
          confirmButtonColor={colors.error}
        />
        <AlertModal
          visible={showAlert}
          title={alertTitle}
          message={alertMessage}
          onClose={handleAlertClose}
        />
      </ImageBackground>
    );
  }

  // 일기 작성 플로우
  return (
    <ImageBackground
      source={require('../../assets/images/night.png')}
      style={styles.container}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      {/* 캐릭터 */}
      {currentCharacter && (
        <View style={styles.characterContainer}>
          <Image
            source={getCharacterImage(currentCharacter.level || 1, currentStep === 'confirm' ? 'happy' : 'default')}
            style={styles.characterImage}
            resizeMode="contain"
            accessibilityLabel={`${currentCharacter.name || '캐릭터'} 이미지`}
          />
        </View>
      )}

      {/* 모달 다이얼로그 */}
      <Animated.View 
        style={[
          currentStep === 'welcome' ? styles.modalContainerWelcome : styles.modalContainer,
          {
            opacity: speechBubbleAnim,
            transform: [
              {
                translateY: speechBubbleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* 질문 */}
        <Text style={styles.modalQuestion}>{getStepMessage()}</Text>

        {/* 단계별 컨텐츠 */}
        <View style={
          currentStep === 'expression' 
            ? styles.modalContentExpression 
            : currentStep === 'factors'
            ? styles.modalContentFactors
            : styles.modalContent
        }>
          {currentStep === 'mood' && (
            <View style={styles.moodContainer}>
              <View 
                ref={sliderRef}
                style={styles.sliderTrack}
                {...panResponder.panHandlers}
              >
                <View style={[
                  styles.sliderFill, 
                  { 
                    width: `${moodValue}%`,
                    backgroundColor: getMoodColor(moodValue)
                  }
                ]} />
                <View style={[styles.sliderThumb, { left: `${moodValue}%` }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>매우 좋지 않음</Text>
                <Text style={styles.sliderLabel}>매우 좋음</Text>
              </View>
            </View>
          )}

          {currentStep === 'emotions' && (
            <EmotionSelectionStep
              selectedEmotions={selectedEmotions}
              customEmotion={emotionText}
              onToggleEmotion={toggleEmotion}
              onCustomEmotionChange={setEmotionText}
            />
          )}

          {currentStep === 'factors' && (
            <FactorSelectionStep
              selectedFactors={selectedFactors}
              customFactor={factorText}
              onToggleFactor={toggleFactor}
              onCustomFactorChange={setFactorText}
            />
          )} 

          {currentStep === 'expression' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={expressionText}
                onChangeText={setExpressionText}
                placeholder="직접 입력하기"
                placeholderTextColor={colors.text.tertiary}
                multiline={true}
                textAlignVertical="top"
                accessibilityLabel="감정 직접 입력"
                accessibilityHint="감정을 직접 입력하세요"
              />
            </View>
          )}
        </View>

        {/* 버튼 */}
        {currentStep === 'welcome' ? (
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.writeButton}
              onPress={handleStartWriting}
            >
              <Text style={styles.writeButtonText}>일기 작성하기</Text>
            </TouchableOpacity>
            {diaries.length > 0 && (
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={handleViewDiaries}
              >
                <Text style={styles.viewButtonText}>일기 보기</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : currentStep === 'expression' ? (
          <View style={[styles.modalButtons, styles.modalButtonsExpression]}>
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="이전 단계로 이동"
            >
              <Text style={styles.skipButtonText}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, !expressionText.trim() && styles.confirmButtonDisabled]}
              onPress={handleNext}
              disabled={!expressionText.trim()}
              accessibilityRole="button"
              accessibilityLabel="일기 등록 완료"
              accessibilityHint={!expressionText.trim() ? "감정 표현을 입력해야 등록할 수 있습니다" : "일기를 등록하고 완료합니다"}
              accessibilityState={{ disabled: !expressionText.trim() }}
            >
              <Text style={styles.confirmButtonText}>등록 완료</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="이전 단계로 이동"
            >
              <Text style={styles.cancelButtonText}>이전</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel="선택 완료하고 다음 단계로 이동"
              accessibilityHint="현재 단계의 선택을 완료하고 다음 단계로 진행합니다"
            >
              <Text style={styles.confirmButtonText}>선택완료</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* 모달 컴포넌트 */}
      <AlertModal
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </ImageBackground>
  );
};


export default DiaryScreen;

