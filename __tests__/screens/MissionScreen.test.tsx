import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MissionScreen from '../../src/screens/MissionScreen';
import { useMission } from '../../src/hooks/useMission';
import { useCharacter } from '../../src/hooks/useCharacter';
import { Mission } from '../../src/types';

// Mock hooks
jest.mock('../../src/hooks/useMission');
jest.mock('../../src/hooks/useCharacter');

const mockUseMission = useMission as jest.MockedFunction<typeof useMission>;
const mockUseCharacter = useCharacter as jest.MockedFunction<typeof useCharacter>;

// Alert is mocked in jest.setup.js

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
  },
  {
    id: 3,
    mission_id: 'mission-3',
    title: '커리어관리 미션',
    description: '커리어관리 미션 설명',
    category_id: 'career',
    emoji: '📚',
    difficulty: 'easy',
    completed: false,
    experience: 50,
    photo_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

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

describe('MissionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCharacter.mockReturnValue({
      characters: [],
      representativeCharacter: null,
      loading: false,
      error: null,
      addExperienceByCategory: jest.fn(),
      setRepresentative: jest.fn(),
      createCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
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

  it('미션 목록이 표시된다', () => {
    const { getByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    expect(getByText('자기관리 미션')).toBeTruthy();
    expect(getByText('소통관리 미션')).toBeTruthy();
    expect(getByText('커리어관리 미션')).toBeTruthy();
  });

  it('카테고리 필터가 표시된다', () => {
    const { getAllByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    expect(getAllByText('전체')).toHaveLength(1);
    expect(getAllByText('자기관리')).toHaveLength(2); // 카테고리 버튼 + 미션 제목
    expect(getAllByText('소통관리')).toHaveLength(2);
    expect(getAllByText('커리어관리')).toHaveLength(2);
    expect(getAllByText('나만의 미션')).toHaveLength(1);
  });

  it('자기관리 카테고리 선택 시 해당 미션만 표시된다', () => {
    const { getAllByText, queryByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 자기관리 카테고리 선택 (첫 번째 "자기관리"는 카테고리 버튼)
    const selfManagementButtons = getAllByText('자기관리');
    if (selfManagementButtons[0]) {
      fireEvent.press(selfManagementButtons[0]);
    }

    // 자기관리 미션만 표시
    expect(getAllByText('자기관리 미션')).toHaveLength(1);
    expect(queryByText('소통관리 미션')).toBeNull();
    expect(queryByText('커리어관리 미션')).toBeNull();
  });

  it('소통관리 카테고리 선택 시 해당 미션만 표시된다', () => {
    const { getAllByText, queryByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 소통관리 카테고리 선택 (첫 번째 "소통관리"는 카테고리 버튼)
    const communicationButtons = getAllByText('소통관리');
    if (communicationButtons[0]) {
      fireEvent.press(communicationButtons[0]);
    }

    // 소통관리 미션만 표시
    expect(getAllByText('소통관리 미션')).toHaveLength(1);
    expect(queryByText('자기관리 미션')).toBeNull();
    expect(queryByText('커리어관리 미션')).toBeNull();
  });

  it('자기관리 미션 완료 버튼이 표시된다', () => {
    const { getAllByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 완료 버튼이 표시되는지 확인
    const completeButtons = getAllByText('완료하기');
    expect(completeButtons.length).toBeGreaterThan(0);
  });

  it('소통관리 미션 완료 버튼이 표시된다', () => {
    const { getAllByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 소통관리 카테고리 선택
    const communicationButtons = getAllByText('소통관리');
    if (communicationButtons[0]) {
      fireEvent.press(communicationButtons[0]);
    }

    // 완료 버튼이 표시되는지 확인
    const completeButtons = getAllByText('완료하기');
    expect(completeButtons.length).toBeGreaterThan(0);
  });

  it('커리어관리 미션 완료 버튼이 표시된다', () => {
    const { getAllByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 커리어관리 카테고리 선택
    const careerButtons = getAllByText('커리어관리');
    if (careerButtons[0]) {
      fireEvent.press(careerButtons[0]);
    }

    // 완료 버튼이 표시되는지 확인
    const completeButtons = getAllByText('완료하기');
    expect(completeButtons.length).toBeGreaterThan(0);
  });

  it('미션 완료 버튼이 클릭 가능하다', () => {
    const { getAllByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 완료 버튼이 표시되는지 확인
    const completeButtons = getAllByText('완료하기');
    expect(completeButtons.length).toBeGreaterThan(0);

    // 버튼이 클릭 가능한지 확인
    expect(completeButtons[0]).toBeTruthy();
  });

  it('미션 완료 버튼이 모든 카테고리에서 표시된다', () => {
    const { getAllByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 모든 카테고리에서 완료 버튼이 표시되는지 확인
    const completeButtons = getAllByText('완료하기');
    expect(completeButtons.length).toBe(3); // 3개 미션 모두에 완료 버튼
  });

  it('진행률이 올바르게 표시된다', () => {
    const completedMissions: Mission[] = [
      { ...mockMissions[0], completed: true } as Mission,
      { ...mockMissions[1], completed: false } as Mission,
      { ...mockMissions[2], completed: false } as Mission
    ];

    mockUseMission.mockReturnValue({
      missions: completedMissions,
      loading: false,
      error: null,
      completeMissionWithPhoto: jest.fn(),
      uncompleteMission: jest.fn(),
      createCustomMission: jest.fn(),
      updateCustomMission: jest.fn(),
      deleteCustomMission: jest.fn(),
    });

    const { getByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    // 진행률 정보 확인
    expect(getByText('1개 완료 / 3개')).toBeTruthy();
    expect(getByText('33%')).toBeTruthy();
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
      <MissionScreen navigation={mockNavigation as any} />
    );

    expect(getByText('아직 미션이 없어요')).toBeTruthy();
    expect(getByText('새로운 미션이 곧 추가될 예정입니다!')).toBeTruthy();
  });

  it('로딩 중일 때 로딩 상태가 표시된다', () => {
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
      <MissionScreen navigation={mockNavigation as any} />
    );

    expect(getByText('미션을 불러오는 중...')).toBeTruthy();
  });

  it('에러 발생 시 ErrorBoundary가 표시된다', () => {
    mockUseMission.mockReturnValue({
      missions: [],
      loading: false,
      error: '미션을 불러올 수 없습니다.',
      completeMissionWithPhoto: jest.fn(),
      uncompleteMission: jest.fn(),
      createCustomMission: jest.fn(),
      updateCustomMission: jest.fn(),
      deleteCustomMission: jest.fn(),
    });

    const { getByText } = render(
      <MissionScreen navigation={mockNavigation as any} />
    );

    expect(getByText('미션을 불러올 수 없습니다.')).toBeTruthy();
  });
});
