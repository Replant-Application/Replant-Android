import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NicknameScreen from '../../src/screens/NicknameScreen';

// Mock UserContext
jest.mock('../../src/contexts/UserContext', () => ({
  useUser: () => ({
    login: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('NicknameScreen', () => {
  it('한글 닉네임 입력이 가능하다', () => {
    const mockOnNavigate = jest.fn();
    const { getByPlaceholderText } = render(
      <NicknameScreen onNavigate={mockOnNavigate} />
    );

    const input = getByPlaceholderText('닉네임을 입력하세요');

    // 한글 입력 테스트
    fireEvent.changeText(input, '김미르');
    expect(input.props.value).toBe('김미르');
  });

  it('영어 닉네임 입력이 가능하다', () => {
    const mockOnNavigate = jest.fn();
    const { getByPlaceholderText } = render(
      <NicknameScreen onNavigate={mockOnNavigate} />
    );

    const input = getByPlaceholderText('닉네임을 입력하세요');

    // 영어 입력 테스트
    fireEvent.changeText(input, 'kimmireu');
    expect(input.props.value).toBe('kimmireu');
  });

  it('한영 혼합 닉네임 입력이 가능하다', () => {
    const mockOnNavigate = jest.fn();
    const { getByPlaceholderText } = render(
      <NicknameScreen onNavigate={mockOnNavigate} />
    );

    const input = getByPlaceholderText('닉네임을 입력하세요');

    // 한영 혼합 입력 테스트
    fireEvent.changeText(input, '김미르123');
    expect(input.props.value).toBe('김미르123');
  });

  it('닉네임 입력 필드가 포커스된다', () => {
    const mockOnNavigate = jest.fn();
    const { getByPlaceholderText } = render(
      <NicknameScreen onNavigate={mockOnNavigate} />
    );

    const input = getByPlaceholderText('닉네임을 입력하세요');
    expect(input.props.autoFocus).toBe(true);
  });

  it('최대 길이 제한이 적용된다', () => {
    const mockOnNavigate = jest.fn();
    const { getByPlaceholderText } = render(
      <NicknameScreen onNavigate={mockOnNavigate} />
    );

    const input = getByPlaceholderText('닉네임을 입력하세요');
    expect(input.props.maxLength).toBe(20);
  });
});
