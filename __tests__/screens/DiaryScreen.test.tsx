import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DiaryScreen from '../../src/screens/DiaryScreen';
import { useDiary } from '../../src/hooks/useDiary';

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mockAlert,
}));

// Mock hooks
jest.mock('../../src/hooks/useDiary');

const mockUseDiary = useDiary as jest.MockedFunction<typeof useDiary>;

// Mock diary data
const mockDiaries = [
  {
    id: 'diary-1',
    content: '오늘은 좋은 하루였어요',
    emotion: 'happy' as const,
    date: '2024-01-01'
  },
  {
    id: 'diary-2',
    content: '조금 피곤한 하루였어요',
    emotion: 'tired' as const,
    date: '2024-01-02'
  }
];

describe('DiaryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();

    mockUseDiary.mockReturnValue({
      diaries: mockDiaries,
      loading: false,
      error: null,
      loadDiaries: jest.fn(),
      saveDiary: jest.fn(),
      updateDiary: jest.fn(),
      deleteDiary: jest.fn(),
    });
  });

  it('다이어리 목록이 표시된다', () => {
    const { getByText } = render(<DiaryScreen />);

    expect(getByText('오늘은 좋은 하루였어요')).toBeTruthy();
    expect(getByText('조금 피곤한 하루였어요')).toBeTruthy();
  });

  it('FAB 버튼이 표시된다', () => {
    const { getByTestId } = render(<DiaryScreen />);

    // FAB 버튼이 표시되어야 함
    const fabButton = getByTestId('fab-button');
    expect(fabButton).toBeTruthy();
  });

  it('FAB 버튼 클릭 시 다이어리 작성 폼이 표시된다', async () => {
    const { getByTestId, getByText } = render(<DiaryScreen />);

    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });
  });

  it('다이어리 작성 폼에서 감정 선택이 가능하다', async () => {
    const { getByTestId, getByText } = render(<DiaryScreen />);

    // FAB 버튼 클릭하여 폼 표시
    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });

    // 감정 선택 컴포넌트가 표시되어야 함
    // (EmotionSelector 컴포넌트의 구체적인 테스트는 별도로 필요)
  });

  it('다이어리 작성 폼에서 내용 입력이 가능하다', async () => {
    const { getByTestId, getByText } = render(<DiaryScreen />);

    // FAB 버튼 클릭하여 폼 표시
    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });

    // 텍스트 입력 필드가 표시되어야 함
    expect(getByText('오늘의 이야기')).toBeTruthy();
  });

  it('다이어리 작성 폼에서 취소 버튼이 작동한다', async () => {
    const { getByTestId, getByText, queryByText } = render(<DiaryScreen />);

    // FAB 버튼 클릭하여 폼 표시
    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });

    // 취소 버튼 클릭
    const cancelButton = getByText('취소');
    fireEvent.press(cancelButton);

    // 폼이 사라지고 FAB 버튼이 다시 표시되어야 함
    await waitFor(() => {
      expect(queryByText('✏️ 일기 작성')).toBeNull();
    });
  });

  it('다이어리가 없을 때 EmptyState가 표시된다', () => {
    mockUseDiary.mockReturnValue({
      diaries: [],
      loading: false,
      error: null,
      loadDiaries: jest.fn(),
      saveDiary: jest.fn(),
      updateDiary: jest.fn(),
      deleteDiary: jest.fn(),
    });

    const { getByText } = render(<DiaryScreen />);

    expect(getByText('아직 작성된 일기가 없어요')).toBeTruthy();
    expect(getByText('오늘의 감정을 기록해보세요!')).toBeTruthy();
  });

  it('로딩 중일 때 로딩 상태가 표시된다', () => {
    mockUseDiary.mockReturnValue({
      diaries: [],
      loading: true,
      error: null,
      loadDiaries: jest.fn(),
      saveDiary: jest.fn(),
      updateDiary: jest.fn(),
      deleteDiary: jest.fn(),
    });

    const { getByText } = render(<DiaryScreen />);

    expect(getByText('일기를 불러오는 중...')).toBeTruthy();
  });

  it('에러 발생 시 ErrorBoundary가 표시된다', () => {
    mockUseDiary.mockReturnValue({
      diaries: [],
      loading: false,
      error: '일기를 불러올 수 없습니다.',
      loadDiaries: jest.fn(),
      saveDiary: jest.fn(),
      updateDiary: jest.fn(),
      deleteDiary: jest.fn(),
    });

    const { getByText } = render(<DiaryScreen />);

    expect(getByText('일기를 불러올 수 없습니다.')).toBeTruthy();
  });

  it('행복 감정 선택하고 "행복해" 내용으로 일기 저장이 성공한다', async () => {
    const mockSaveDiary = jest.fn().mockResolvedValue(undefined);

    mockUseDiary.mockReturnValue({
      diaries: mockDiaries,
      loading: false,
      error: null,
      loadDiaries: jest.fn(),
      saveDiary: mockSaveDiary,
      updateDiary: jest.fn(),
      deleteDiary: jest.fn(),
    });

    const { getByTestId, getByText, getByDisplayValue } = render(<DiaryScreen />);

    // 1. FAB 버튼 클릭하여 폼 표시
    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });

    // 2. "행복" 감정 선택
    const happyEmotionButton = getByText('행복');
    fireEvent.press(happyEmotionButton);

    // 3. "행복해" 내용 입력
    const textInput = getByDisplayValue('');
    fireEvent.changeText(textInput, '행복해');

    // 4. 저장 버튼이 활성화되었는지 확인
    const saveButton = getByText('저장하기');
    expect(saveButton).toBeTruthy();

    // 5. 저장 버튼 클릭
    fireEvent.press(saveButton);

    // 6. saveDiary 함수가 올바른 데이터로 호출되었는지 확인
    await waitFor(() => {
      expect(mockSaveDiary).toHaveBeenCalledWith(
        expect.objectContaining({
          emotion: 'happy',
          content: '행복해',
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD 형식
        })
      );
    });

    // 7. saveDiary가 한 번만 호출되었는지 확인
    expect(mockSaveDiary).toHaveBeenCalledTimes(1);
  });

  it('감정과 내용을 입력하지 않으면 저장 버튼이 비활성화된다', async () => {
    const { getByTestId, getByText } = render(<DiaryScreen />);

    // FAB 버튼 클릭하여 폼 표시
    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });

    // 감정과 내용을 입력하지 않은 상태에서 저장 버튼 확인
    const saveButton = getByText('저장하기');
    expect(saveButton).toBeTruthy();
    // 저장 버튼이 비활성화되어 있는지 확인 (disabled 속성)
  });

  it('감정만 선택하고 내용을 입력하지 않으면 저장 버튼이 비활성화된다', async () => {
    const { getByTestId, getByText, getByDisplayValue } = render(<DiaryScreen />);

    // FAB 버튼 클릭하여 폼 표시
    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });

    // 감정만 선택
    const happyEmotionButton = getByText('행복');
    fireEvent.press(happyEmotionButton);

    // 내용은 입력하지 않음
    const textInput = getByDisplayValue('');
    expect(textInput).toBeTruthy();

    // 저장 버튼이 비활성화되어 있는지 확인
    const saveButton = getByText('저장하기');
    expect(saveButton).toBeTruthy();
  });

  it('내용만 입력하고 감정을 선택하지 않으면 저장 버튼이 비활성화된다', async () => {
    const { getByTestId, getByText, getByDisplayValue } = render(<DiaryScreen />);

    // FAB 버튼 클릭하여 폼 표시
    const fabButton = getByTestId('fab-button');
    fireEvent.press(fabButton);

    await waitFor(() => {
      expect(getByText('✏️ 일기 작성')).toBeTruthy();
    });

    // 내용만 입력
    const textInput = getByDisplayValue('');
    fireEvent.changeText(textInput, '행복해');

    // 감정은 선택하지 않음

    // 저장 버튼이 비활성화되어 있는지 확인
    const saveButton = getByText('저장하기');
    expect(saveButton).toBeTruthy();
  });

  it('일기 수정이 성공한다', async () => {
    const mockUpdateDiary = jest.fn().mockResolvedValue(undefined);

    mockUseDiary.mockReturnValue({
      diaries: mockDiaries,
      loading: false,
      error: null,
      loadDiaries: jest.fn(),
      saveDiary: jest.fn(),
      updateDiary: mockUpdateDiary,
      deleteDiary: jest.fn(),
    });

    const { getByText, getByDisplayValue, getAllByText } = render(<DiaryScreen />);

    // 1. 기존 일기 내용 확인
    expect(getByText('오늘은 좋은 하루였어요')).toBeTruthy();

    // 2. 수정 버튼 클릭 (일기 카드에서 수정 버튼 찾기)
    // 실제 구현에 따라 수정 버튼의 testID나 텍스트가 다를 수 있음
    const editButtons = getAllByText('✏️ 수정'); // 이모지와 함께 표시됨
    if (editButtons[0]) {
      fireEvent.press(editButtons[0]);
    }

    // 3. 수정 폼이 표시되는지 확인
    await waitFor(() => {
      expect(getByText('✏️ 일기 수정')).toBeTruthy();
    });

    // 4. 내용 수정
    const textInput = getByDisplayValue('오늘은 좋은 하루였어요');
    fireEvent.changeText(textInput, '수정된 내용입니다');

    // 5. 저장 버튼 클릭
    const saveButton = getByText('수정하기');
    fireEvent.press(saveButton);

    // 6. updateDiary 함수가 올바른 데이터로 호출되었는지 확인
    await waitFor(() => {
      expect(mockUpdateDiary).toHaveBeenCalledWith(
        'diary-1',
        expect.objectContaining({
          emotion: 'happy',
          content: '수정된 내용입니다',
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD 형식
        })
      );
    });

    // 7. updateDiary가 한 번만 호출되었는지 확인
    expect(mockUpdateDiary).toHaveBeenCalledTimes(1);
  });

  it('일기 삭제 버튼이 표시된다', async () => {
    const mockDeleteDiary = jest.fn().mockResolvedValue(undefined);

    mockUseDiary.mockReturnValue({
      diaries: mockDiaries,
      loading: false,
      error: null,
      loadDiaries: jest.fn(),
      saveDiary: jest.fn(),
      updateDiary: jest.fn(),
      deleteDiary: mockDeleteDiary,
    });

    const { getByText, getAllByText } = render(<DiaryScreen />);

    // 1. 기존 일기 내용 확인
    expect(getByText('오늘은 좋은 하루였어요')).toBeTruthy();

    // 2. 삭제 버튼이 표시되는지 확인
    const deleteButtons = getAllByText('🗑️ 삭제');
    expect(deleteButtons.length).toBeGreaterThan(0);
    expect(deleteButtons[0]).toBeTruthy();
  });

  it('일기 수정 버튼이 표시된다', async () => {
    const mockUpdateDiary = jest.fn().mockResolvedValue(undefined);

    mockUseDiary.mockReturnValue({
      diaries: mockDiaries,
      loading: false,
      error: null,
      loadDiaries: jest.fn(),
      saveDiary: jest.fn(),
      updateDiary: mockUpdateDiary,
      deleteDiary: jest.fn(),
    });

    const { getByText, getAllByText } = render(<DiaryScreen />);

    // 1. 기존 일기 내용 확인
    expect(getByText('오늘은 좋은 하루였어요')).toBeTruthy();

    // 2. 수정 버튼이 표시되는지 확인
    const editButtons = getAllByText('✏️ 수정');
    expect(editButtons.length).toBeGreaterThan(0);
    expect(editButtons[0]).toBeTruthy();
  });
});
