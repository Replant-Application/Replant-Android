import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CharacterGuideScreen from '../../src/screens/CharacterGuideScreen';
import { useCharacter } from '../../src/hooks/useCharacter';
import { Character } from '../../src/types';

// Mock hooks
jest.mock('../../src/hooks/useCharacter');

const mockUseCharacter = useCharacter as jest.MockedFunction<typeof useCharacter>;

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

// Mock character data
const mockCharacters: Character[] = [
  {
    id: '1',
    character_id: 'char-1',
    name: '자기관리 캐릭터',
    title: '자기관리 캐릭터',
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
  },
  {
    id: '2',
    character_id: 'char-2',
    name: '소통관리 캐릭터',
    title: '소통관리 캐릭터',
    description: '따뜻한 대화로 세상을 더 아름답게 만들어가요',
    emoji: '💬',
    level: 2,
    experience: 80,
    total_experience: 180,
    max_experience: 200,
    unlocked: true,
    completed_missions: 3,
    category_id: 'communication',
    unlocked_date: '2024-01-02T00:00:00Z',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    character_id: 'char-3',
    name: '커리어관리 캐릭터',
    title: '커리어관리 캐릭터',
    description: '꿈을 현실로 만드는 과정을 즐기고 있어요',
    emoji: '📚',
    level: 4,
    experience: 200,
    total_experience: 400,
    max_experience: 500,
    unlocked: true,
    completed_missions: 8,
    category_id: 'career',
    unlocked_date: '2024-01-03T00:00:00Z',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
];

const mockRepresentativeCharacter = mockCharacters[0] || null;

describe('CharacterGuideScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCharacter.mockReturnValue({
      characters: mockCharacters,
      representativeCharacter: mockRepresentativeCharacter,
      loading: false,
      error: null,
      addExperienceByCategory: jest.fn(),
      setRepresentative: jest.fn(),
      createCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
    });
  });

  it('모든 카테고리 캐릭터가 도감에 표시된다', () => {
    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 자기관리 캐릭터 확인
    expect(getByText('자기관리 캐릭터')).toBeTruthy();
    expect(getByText('🧘 자기관리')).toBeTruthy();

    // 소통관리 캐릭터 확인
    expect(getByText('소통관리 캐릭터')).toBeTruthy();
    expect(getByText('💬 소통관리')).toBeTruthy();

    // 커리어관리 캐릭터 확인
    expect(getByText('커리어관리 캐릭터')).toBeTruthy();
    expect(getByText('📚 커리어관리')).toBeTruthy();
  });

  it('각 캐릭터의 레벨 정보가 올바르게 표시된다', () => {
    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 레벨 정보 확인
    expect(getByText('Lv.3')).toBeTruthy();
    expect(getByText('Lv.2')).toBeTruthy();
    expect(getByText('Lv.4')).toBeTruthy();

    // 레벨 이름 확인
    expect(getByText('어린 식물')).toBeTruthy(); // level 3
    expect(getByText('새싹')).toBeTruthy(); // level 2
    expect(getByText('나무')).toBeTruthy(); // level 4
  });

  it('각 캐릭터의 경험치 정보가 올바르게 표시된다', () => {
    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 현재 경험치 확인
    expect(getByText('50 EXP')).toBeTruthy(); // 150 % 100 = 50
    expect(getByText('80 EXP')).toBeTruthy(); // 80 % 100 = 80
    expect(getByText('0 EXP')).toBeTruthy(); // 200 % 100 = 0

    // 총 경험치 확인
    expect(getByText('250 EXP')).toBeTruthy();
    expect(getByText('180 EXP')).toBeTruthy();
    expect(getByText('400 EXP')).toBeTruthy();
  });

  it('각 캐릭터의 해제일이 올바르게 표시된다', () => {
    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 해제일 확인 (한국어 형식)
    expect(getByText('2024. 1. 1.')).toBeTruthy();
    expect(getByText('2024. 1. 2.')).toBeTruthy();
    expect(getByText('2024. 1. 3.')).toBeTruthy();
  });

  it('대표 캐릭터가 맨 위에 표시된다', () => {
    const { getAllByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 대표 캐릭터 배지 확인
    expect(getAllByText('⭐ 대표 캐릭터')).toHaveLength(1);
  });

  it('대표가 아닌 캐릭터에 대표 설정 버튼이 표시된다', () => {
    const { getAllByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 대표 설정 버튼 확인
    const setRepresentativeButtons = getAllByText('대표로 설정');
    expect(setRepresentativeButtons).toHaveLength(2); // 자기관리 캐릭터 제외
  });

  it('캐릭터 카드 클릭 시 상세 페이지로 이동한다', () => {
    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 소통관리 캐릭터 카드 클릭
    const characterCard = getByText('소통관리 캐릭터');
    fireEvent.press(characterCard);

    // CharacterDetail 페이지로 이동하는지 확인
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CharacterDetail', {
      character: mockCharacters[1]
    });
  });

  it('대표 캐릭터 설정 버튼이 표시된다', () => {
    const { getAllByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 대표 설정 버튼이 표시되는지 확인
    const setRepresentativeButtons = getAllByText('대표로 설정');
    expect(setRepresentativeButtons.length).toBeGreaterThan(0);
  });

  it('진행률 바가 올바르게 표시된다', () => {
    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 다음 레벨까지 경험치 확인
    expect(getByText('다음 레벨까지 50 EXP')).toBeTruthy(); // 100 - 50 = 50
    expect(getByText('다음 레벨까지 20 EXP')).toBeTruthy(); // 100 - 80 = 20
    expect(getByText('다음 레벨까지 100 EXP')).toBeTruthy(); // 100 - 0 = 100
  });

  it('캐릭터가 없을 때 EmptyState가 표시된다', () => {
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

    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    expect(getByText('캐릭터가 없어요')).toBeTruthy();
    expect(getByText('아직 캐릭터가 없습니다.')).toBeTruthy();
  });

  it('로딩 중일 때 로딩 상태가 표시된다', () => {
    mockUseCharacter.mockReturnValue({
      characters: [],
      representativeCharacter: null,
      loading: true,
      error: null,
      addExperienceByCategory: jest.fn(),
      setRepresentative: jest.fn(),
      createCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
    });

    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    expect(getByText('캐릭터 정보를 불러오는 중...')).toBeTruthy();
  });

  it('에러 발생 시 에러 상태가 표시된다', () => {
    mockUseCharacter.mockReturnValue({
      characters: [],
      representativeCharacter: null,
      loading: false,
      error: '캐릭터 정보를 불러올 수 없습니다.',
      addExperienceByCategory: jest.fn(),
      setRepresentative: jest.fn(),
      createCharacter: jest.fn(),
      updateCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
    });

    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    expect(getByText('캐릭터 정보를 불러올 수 없습니다.')).toBeTruthy();
  });

  it('각 카테고리별 아이콘이 올바르게 표시된다', () => {
    const { getByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 카테고리 아이콘 확인
    expect(getByText('🧘 자기관리')).toBeTruthy();
    expect(getByText('💬 소통관리')).toBeTruthy();
    expect(getByText('📚 커리어관리')).toBeTruthy();
  });

  it('캐릭터 정보가 올바른 형식으로 표시된다', () => {
    const { getByText, getAllByText } = render(
      <CharacterGuideScreen navigation={mockNavigation as any} />
    );

    // 캐릭터 이름
    expect(getByText('자기관리 캐릭터')).toBeTruthy();
    expect(getByText('소통관리 캐릭터')).toBeTruthy();
    expect(getByText('커리어관리 캐릭터')).toBeTruthy();

    // 레벨 표시
    expect(getByText('Lv.3')).toBeTruthy();
    expect(getByText('Lv.2')).toBeTruthy();
    expect(getByText('Lv.4')).toBeTruthy();

    // 경험치 표시 (여러 개가 있으므로 길이로 확인)
    const currentExpLabels = getAllByText('현재 경험치');
    const totalExpLabels = getAllByText('총 경험치');
    const unlockDateLabels = getAllByText('해제일');

    expect(currentExpLabels.length).toBe(3);
    expect(totalExpLabels.length).toBe(3);
    expect(unlockDateLabels.length).toBe(3);
  });
});
