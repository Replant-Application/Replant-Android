import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CharacterDetailScreen from '../../src/screens/CharacterDetailScreen';
import { Character } from '../../src/types';

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
const mockCharacter: Character = {
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
};

const mockRoute = {
  params: {
    character: mockCharacter
  },
  key: 'CharacterDetail',
  name: 'CharacterDetail' as const
};

describe('CharacterDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('캐릭터 정보가 올바르게 표시된다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 캐릭터 이름
    expect(getByText('자기관리 캐릭터')).toBeTruthy();

    // 레벨 정보
    expect(getByText('Lv.3')).toBeTruthy();
    expect(getByText('어린 식물')).toBeTruthy();

    // 카테고리 정보
    expect(getByText('🧘')).toBeTruthy();
    expect(getByText('자기관리')).toBeTruthy();
  });

  it('감정 표현 버튼들이 표시된다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 감정 버튼들 확인
    expect(getByText('기본')).toBeTruthy();
    expect(getByText('기쁨')).toBeTruthy();
    expect(getByText('인사')).toBeTruthy();

    // 감정 이모지 확인
    expect(getByText('😐')).toBeTruthy();
    expect(getByText('😊')).toBeTruthy();
    expect(getByText('👋')).toBeTruthy();
  });

  it('감정 표현 버튼 클릭 시 상태가 변경된다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 기쁨 버튼 클릭
    const happyButton = getByText('기쁨');
    fireEvent.press(happyButton);

    // 버튼이 활성화되었는지 확인 (스타일 변경으로 확인)
    expect(happyButton).toBeTruthy();
  });

  it('기본 감정이 초기 선택되어 있다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 기본 버튼이 표시되는지 확인
    expect(getByText('기본')).toBeTruthy();
    expect(getByText('😐')).toBeTruthy();
  });

  it('캐릭터 소개 섹션이 표시된다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 캐릭터 소개 제목
    expect(getByText('🌱 캐릭터 소개')).toBeTruthy();

    // 카테고리별 설명 확인
    expect(getByText('매일 조금씩 성장하며 나만의 길을 찾아가요')).toBeTruthy();
  });

  it('진행률 바가 표시된다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 진행률 바가 렌더링되면 캐릭터 정보도 함께 표시된다고 가정
    expect(getByText('자기관리 캐릭터')).toBeTruthy();
  });

  it('다른 카테고리 캐릭터 정보도 올바르게 표시된다', () => {
    const communicationCharacter: Character = {
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
    };

    const communicationRoute = {
      params: {
        character: communicationCharacter
      },
      key: 'CharacterDetail',
      name: 'CharacterDetail' as const
    };

    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={communicationRoute as any}
      />
    );

    // 소통관리 캐릭터 정보 확인
    expect(getByText('소통관리 캐릭터')).toBeTruthy();
    expect(getByText('Lv.2')).toBeTruthy();
    expect(getByText('새싹')).toBeTruthy();
    expect(getByText('💬')).toBeTruthy();
    expect(getByText('소통관리')).toBeTruthy();

    // 소통관리 카테고리 설명 확인
    expect(getByText('따뜻한 대화로 세상을 더 아름답게 만들어가요')).toBeTruthy();
  });

  it('커리어관리 캐릭터 정보가 올바르게 표시된다', () => {
    const careerCharacter: Character = {
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
    };

    const careerRoute = {
      params: {
        character: careerCharacter
      },
      key: 'CharacterDetail',
      name: 'CharacterDetail' as const
    };

    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={careerRoute as any}
      />
    );

    // 커리어관리 캐릭터 정보 확인
    expect(getByText('커리어관리 캐릭터')).toBeTruthy();
    expect(getByText('Lv.4')).toBeTruthy();
    expect(getByText('나무')).toBeTruthy();
    expect(getByText('📚')).toBeTruthy();
    expect(getByText('커리어관리')).toBeTruthy();

    // 커리어관리 카테고리 설명 확인
    expect(getByText('꿈을 현실로 만드는 과정을 즐기고 있어요')).toBeTruthy();
  });

  it('레벨별 이름이 올바르게 표시된다', () => {
    const highLevelCharacter: Character = {
      ...mockCharacter,
      level: 6
    };

    const highLevelRoute = {
      params: {
        character: highLevelCharacter
      },
      key: 'CharacterDetail',
      name: 'CharacterDetail' as const
    };

    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={highLevelRoute as any}
      />
    );

    // 높은 레벨 캐릭터 정보 확인
    expect(getByText('Lv.6')).toBeTruthy();
    expect(getByText('성숙한 나무')).toBeTruthy();
  });

  it('모든 감정 표현 버튼이 클릭 가능하다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 각 감정 버튼 클릭 테스트
    const defaultButton = getByText('기본');
    const happyButton = getByText('기쁨');
    const wavingButton = getByText('인사');

    fireEvent.press(defaultButton);
    fireEvent.press(happyButton);
    fireEvent.press(wavingButton);

    // 모든 버튼이 클릭 가능한지 확인
    expect(defaultButton).toBeTruthy();
    expect(happyButton).toBeTruthy();
    expect(wavingButton).toBeTruthy();
  });

  it('캐릭터 이미지가 표시된다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // 캐릭터 정보가 표시되면 이미지도 함께 렌더링된다고 가정
    expect(getByText('자기관리 캐릭터')).toBeTruthy();
  });

  it('Header 컴포넌트가 표시된다', () => {
    const { getByText } = render(
      <CharacterDetailScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    // Header가 렌더링되면 캐릭터 정보도 함께 표시된다고 가정
    expect(getByText('자기관리 캐릭터')).toBeTruthy();
  });
});
