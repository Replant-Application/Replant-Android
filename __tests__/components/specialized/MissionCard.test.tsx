import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MissionCard from '../../../src/components/specialized/MissionCard';
import { Mission } from '../../../src/types';

// Mock mission data
const mockMission: Mission = {
  id: 1,
  mission_id: 'test-mission-1',
  title: '테스트 미션',
  description: '테스트 미션 설명',
  category_id: 'growth',
  emoji: '🧘',
  difficulty: 'easy',
  completed: false,
  experience: 50,
  photo_url: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('MissionCard', () => {
  it('readonly 모드에서 자세히 보기 버튼이 표시된다', () => {
    const mockOnViewDetails = jest.fn();

    const { getByText } = render(
      <MissionCard
        mission={mockMission}
        readonly={true}
        onViewDetails={mockOnViewDetails}
      />
    );

    const viewDetailsButton = getByText('자세히 보기');
    expect(viewDetailsButton).toBeTruthy();
  });

  it('자세히 보기 버튼 클릭 시 onViewDetails가 올바른 mission_id로 호출된다', () => {
    const mockOnViewDetails = jest.fn();

    const { getByText } = render(
      <MissionCard
        mission={mockMission}
        readonly={true}
        onViewDetails={mockOnViewDetails}
      />
    );

    const viewDetailsButton = getByText('자세히 보기');
    fireEvent.press(viewDetailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith('test-mission-1');
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('readonly 모드가 아닐 때 자세히 보기 버튼이 표시되지 않는다', () => {
    const mockOnComplete = jest.fn();

    const { queryByText } = render(
      <MissionCard
        mission={mockMission}
        readonly={false}
        onComplete={mockOnComplete}
      />
    );

    const viewDetailsButton = queryByText('자세히 보기');
    expect(viewDetailsButton).toBeNull();
  });

  it('readonly 모드에서 완료/취소 버튼이 표시되지 않는다', () => {
    const mockOnViewDetails = jest.fn();

    const { queryByText } = render(
      <MissionCard
        mission={mockMission}
        readonly={true}
        onViewDetails={mockOnViewDetails}
      />
    );

    const completeButton = queryByText('완료하기');
    const uncompleteButton = queryByText('완료 취소');

    expect(completeButton).toBeNull();
    expect(uncompleteButton).toBeNull();
  });

  it('미션 정보가 올바르게 표시된다', () => {
    const mockOnViewDetails = jest.fn();

    const { getByText } = render(
      <MissionCard
        mission={mockMission}
        readonly={true}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('테스트 미션')).toBeTruthy();
    expect(getByText('테스트 미션 설명')).toBeTruthy();
    expect(getByText('자기관리')).toBeTruthy();
    expect(getByText('+50 EXP')).toBeTruthy();
  });

  it('완료된 미션의 상태가 올바르게 표시된다', () => {
    const completedMission = { ...mockMission, completed: true };
    const mockOnViewDetails = jest.fn();

    const { getByText } = render(
      <MissionCard
        mission={completedMission}
        readonly={true}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('✅ 완료')).toBeTruthy();
  });

  it('진행중인 미션의 상태가 올바르게 표시된다', () => {
    const mockOnViewDetails = jest.fn();

    const { getByText } = render(
      <MissionCard
        mission={mockMission}
        readonly={true}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('⏳ 진행중')).toBeTruthy();
  });
});
