import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { useCharacter } from '../../src/hooks/useCharacter';
import { useMission } from '../../src/hooks/useMission';
import { Mission, Character } from '../../src/types';

// Mock hooks
jest.mock('../../src/hooks/useCharacter');
jest.mock('../../src/hooks/useMission');

const mockUseCharacter = useCharacter as jest.MockedFunction<typeof useCharacter>;
const mockUseMission = useMission as jest.MockedFunction<typeof useMission>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock mission data
const mockMissions: Mission[] = [
  {
    id: 1,
    mission_id: 'mission-1',
    title: '자기관리 미션',
    description: '자기관리 미션 설명',
    category_id: 'self_management',
    emoji: '🧘',
    difficulty: 'easy',
    completed: false,
    experience: 50,
    photo_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    mission_id: 'mission-2',
    title: '소통관리 미션',
    description: '소통관리 미션 설명',
    category_id: 'communication',
    emoji: '💬',
    difficulty: 'easy',
    completed: false,
    experience: 50,
    photo_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockRepresentativeCharacter: Character = {
  id: '1',
  character_id: 'char-1',
  name: '테스트 대표 캐릭터',
  title: '테스트 대표 캐릭터',
  description: '매일 조금씩 성장하며 나만의 길을 찾아가요',
  emoji: '🧘',
  level: 3,
  experience: 150,
  total_experience: 250,
  max_experience: 300,
  unlocked: true,
  completed_missions: 5,
  category_id: 'self_management',
  unlocked_date: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('HomeScreen', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCharacter.mockReturnValue({
      characters: [],
      selectedCharacter: null,
      representativeCharacter: mockRepresentativeCharacter,
      loading: false,
      error: null,
      loadCharacters: jest.fn(),
      addExperienceByCategory: jest.fn(),
      selectCharacter: jest.fn(),
      setRepresentative: jest.fn(),
    });

    mockUseMission.mockReturnValue({
      missions: mockMissions,
      loading: false,
      error: null,
      completeMissionWithPhoto: jest.fn(),
      uncompleteMission: jest.fn(),
      createCustomMission: jest.fn(),
      updateCustomMission: jest.fn(),
      deleteCustomMission: jest.fn(),
    });
  });

  it('추천 미션 카드가 표시된다', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    expect(getByText('자기관리 미션')).toBeTruthy();
    expect(getByText('소통관리 미션')).toBeTruthy();
  });

  it('미션 카드의 자세히 보기 버튼 클릭 시 미션 탭으로 이동한다', async () => {
    const { getAllByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    const viewDetailsButtons = getAllByText('자세히 보기');
    if (viewDetailsButtons[0]) {
      fireEvent.press(viewDetailsButtons[0]);
    }

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Mission');
    });
  });

  it('여러 미션 카드의 자세히 보기 버튼이 모두 작동한다', async () => {
    const { getAllByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    const viewDetailsButtons = getAllByText('자세히 보기');
    expect(viewDetailsButtons).toHaveLength(2);

    // 첫 번째 버튼 클릭
    if (viewDetailsButtons[0]) {
      fireEvent.press(viewDetailsButtons[0]);
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Mission');
      });
    }

    // 두 번째 버튼 클릭
    if (viewDetailsButtons[1]) {
      fireEvent.press(viewDetailsButtons[1]);
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Mission');
      });
    }

    expect(mockNavigation.navigate).toHaveBeenCalledTimes(2);
  });

  it('미션 카드가 readonly 모드로 렌더링된다', () => {
    const { getAllByText, queryByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    // 자세히 보기 버튼은 있지만
    const viewDetailsButtons = getAllByText('자세히 보기');
    expect(viewDetailsButtons).toHaveLength(2);

    // 완료하기 버튼은 없어야 함
    expect(queryByText('완료하기')).toBeNull();
    expect(queryByText('완료 취소')).toBeNull();
  });

  it('미션이 없을 때 EmptyState가 표시된다', () => {
    mockUseMission.mockReturnValue({
      missions: [],
      loading: false,
      error: null,
      completeMissionWithPhoto: jest.fn(),
      uncompleteMission: jest.fn(),
      createCustomMission: jest.fn(),
      updateCustomMission: jest.fn(),
      deleteCustomMission: jest.fn(),
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    expect(getByText('모든 미션을 완료했습니다!')).toBeTruthy();
    expect(getByText('새로운 미션이 곧 추가될 예정입니다.')).toBeTruthy();
  });

  it('미션 로딩 중일 때 로딩 상태가 표시된다', () => {
    mockUseMission.mockReturnValue({
      missions: [],
      loading: true,
      error: null,
      completeMissionWithPhoto: jest.fn(),
      uncompleteMission: jest.fn(),
      createCustomMission: jest.fn(),
      updateCustomMission: jest.fn(),
      deleteCustomMission: jest.fn(),
    });

    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    expect(getByText('미션을 불러오는 중...')).toBeTruthy();
  });

  it('대표 캐릭터 정보가 올바르게 표시된다', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    expect(getByText('테스트 대표 캐릭터')).toBeTruthy();
  });

  it('대표 캐릭터 카드 클릭 시 상세 페이지로 이동한다', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    const characterCard = getByText('테스트 대표 캐릭터');
    fireEvent.press(characterCard);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CharacterDetail', {
        character: mockRepresentativeCharacter
      });
    });
  });

});
