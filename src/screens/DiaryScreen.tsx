import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useDiary } from '../hooks/useDiary';
import { DiaryCard, EmotionSelector } from '../components/specialized';
import { Button, Card, Loading, ErrorBoundary } from '../components/ui';
import { colors, spacing, typography, borderRadius } from '../utils/designTokens';

interface Diary {
  id: string;
  date: string;
  emotion: string;
  content: string;
}

interface DiaryScreenProps {
  navigation: any;
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({ navigation }) => {
  const { diaries, loading, error, saveDiary, updateDiary, deleteDiary } = useDiary();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [diaryContent, setDiaryContent] = useState<string>('');

  const handleSaveDiary = async (): Promise<void> => {
    if (!selectedEmotion || !diaryContent.trim()) {
      Alert.alert('오류', '감정과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const diaryData = {
        date: new Date().toISOString().split('T')[0],
        emotion: selectedEmotion,
        content: diaryContent.trim(),
      };

      if (editingDiary) {
        await updateDiary(editingDiary.id, diaryData);
        setEditingDiary(null);
      } else {
        await saveDiary(diaryData);
      }
      
      setShowForm(false);
      setSelectedEmotion('');
      setDiaryContent('');
    } catch (saveError) {
      Alert.alert('오류', '일기 저장에 실패했습니다.');
    }
  };

  const handleEditDiary = (diary: Diary): void => {
    setEditingDiary(diary);
    setSelectedEmotion(diary.emotion);
    setDiaryContent(diary.content);
    setShowForm(true);
  };

  const handleDeleteDiary = (diaryId: string): void => {
    Alert.alert(
      '일기 삭제',
      '정말로 이 일기를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDiary(diaryId);
            } catch (deleteError) {
              Alert.alert('오류', '일기 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleCancelEdit = (): void => {
    setShowForm(false);
    setEditingDiary(null);
    setSelectedEmotion('');
    setDiaryContent('');
  };

  if (loading) {
    return <Loading text="일기를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>다이어리</Text>
        <Text style={styles.userInfo}>사용자님</Text>
      </View>

      {!showForm ? (
        <>
          {/* 일기 목록 */}
          <View style={styles.diaryList}>
            {diaries.length > 0 ? (
              diaries.map((diary) => (
                <DiaryCard
                  key={diary.id}
                  diary={diary}
                  onEdit={handleEditDiary}
                  onDelete={handleDeleteDiary}
                  style={styles.diaryCard}
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  아직 작성된 일기가 없어요.{'\n'}
                  첫 번째 일기를 작성해보세요!
                </Text>
                <Button
                  title="일기 작성하기"
                  onPress={() => setShowForm(true)}
                  style={styles.writeButton}
                />
              </Card>
            )}
          </View>

          {/* 작성 버튼 */}
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* 일기 작성 폼 */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingDiary ? '일기 수정' : '새 일기 작성'}
            </Text>
            
            <View style={styles.formContent}>
              <Text style={styles.label}>오늘의 감정</Text>
              <EmotionSelector
                selectedEmotion={selectedEmotion}
                onSelect={setSelectedEmotion}
                style={styles.emotionSelector}
              />
              
              <Text style={styles.label}>일기 내용</Text>
              <TextInput
                style={styles.textInput}
                value={diaryContent}
                onChangeText={setDiaryContent}
                placeholder="오늘 하루는 어땠나요?"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formActions}>
              <Button
                title="취소"
                onPress={handleCancelEdit}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={editingDiary ? '수정하기' : '저장하기'}
                onPress={handleSaveDiary}
                style={styles.saveButton}
              />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[20],
    paddingBottom: spacing[5],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userInfo: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  diaryList: {
    padding: spacing[5],
  },
  diaryCard: {
    marginBottom: spacing[3],
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[4],
  },
  writeButton: {
    backgroundColor: colors.primary[500],
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing[20], // 하단 네비게이션 바 위로 올림
    right: spacing[5],
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  formContainer: {
    padding: spacing[5],
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  formContent: {
    marginBottom: spacing[6],
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emotionSelector: {
    marginBottom: spacing[4],
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.base,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.border.primary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
});

export default DiaryScreen;
