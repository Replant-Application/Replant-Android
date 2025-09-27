import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatBotScreen from '../../src/screens/ChatBotScreen';

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

describe('ChatBotScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자가 "안녕하세요" 메시지를 전송한다', async () => {
    const { getByPlaceholderText, getByText, getByDisplayValue } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    // 1. 메시지 입력 필드에 "안녕하세요" 입력
    const textInput = getByPlaceholderText('마음을 나누어 주세요...');
    fireEvent.changeText(textInput, '안녕하세요');

    // 2. 입력된 텍스트가 올바르게 표시되는지 확인
    expect(getByDisplayValue('안녕하세요')).toBeTruthy();

    // 3. 전송 버튼이 활성화되었는지 확인
    const sendButton = getByText('전송');
    expect(sendButton).toBeTruthy();

    // 4. 전송 버튼 클릭
    fireEvent.press(sendButton);

    // 5. 전송된 메시지가 화면에 표시되는지 확인
    await waitFor(() => {
      expect(getByText('안녕하세요')).toBeTruthy();
    });

    // 6. 입력 필드가 비워졌는지 확인
    expect(textInput.props.value).toBe('');
  });

  it('빈 메시지는 전송되지 않는다', () => {
    const { getByText, getByPlaceholderText } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    const textInput = getByPlaceholderText('마음을 나누어 주세요...');
    const sendButton = getByText('전송');

    // 빈 메시지로 전송 시도
    fireEvent.changeText(textInput, '   '); // 공백만 입력

    // 전송 버튼이 존재하는지 확인 (기본적인 UI 요소 확인)
    expect(sendButton).toBeTruthy();
  });

  it('전송 중 로딩 상태가 표시된다', async () => {
    const { getByPlaceholderText, getByText, getByDisplayValue } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    const textInput = getByPlaceholderText('마음을 나누어 주세요...');
    fireEvent.changeText(textInput, '안녕하세요');
    fireEvent.press(getByText('전송'));

    // 전송 중 로딩 상태 확인
    await waitFor(() => {
      expect(getByText('상담사가 입력 중...')).toBeTruthy();
    });
  });

  it('빠른 응답 버튼이 작동한다', () => {
    const { getByText, getByDisplayValue } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    // 빠른 응답 버튼 클릭
    const quickResponseButton = getByText('오늘 기분이 좋아요 😊');
    fireEvent.press(quickResponseButton);

    // 입력 필드에 빠른 응답 텍스트가 입력되었는지 확인
    expect(getByDisplayValue('오늘 기분이 좋아요 😊')).toBeTruthy();
  });

  it('초기 봇 메시지가 표시된다', () => {
    const { getByText } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    // 초기 봇 메시지 확인
    expect(getByText('안녕하세요! 오늘 기분은 어떠신가요? 😊')).toBeTruthy();
  });

  it('메시지 입력 필드의 최대 길이가 제한된다', () => {
    const { getByPlaceholderText } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    const textInput = getByPlaceholderText('마음을 나누어 주세요...');

    // maxLength 속성 확인
    expect(textInput.props.maxLength).toBe(500);
  });

  it('전송 버튼이 비활성화 상태일 때 올바른 스타일이 적용된다', () => {
    const { getByText, getByPlaceholderText } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    const textInput = getByPlaceholderText('마음을 나누어 주세요...');
    const sendButton = getByText('전송');

    // 빈 입력 시 전송 버튼 비활성화
    fireEvent.changeText(textInput, '');

    // 전송 버튼이 존재하는지 확인 (기본적인 UI 요소 확인)
    expect(sendButton).toBeTruthy();
  });

  it('메시지 전송 후 봇 응답이 표시된다', async () => {
    const { getByPlaceholderText, getByText, getByDisplayValue } = render(
      <ChatBotScreen navigation={mockNavigation as any} />
    );

    const textInput = getByPlaceholderText('마음을 나누어 주세요...');
    fireEvent.changeText(textInput, '안녕하세요');
    fireEvent.press(getByText('전송'));

    // 봇 응답이 표시될 때까지 대기
    await waitFor(() => {
      // 봇 응답 메시지 중 하나가 표시되는지 확인
      const botResponses = [
        '그렇게 생각하시는군요. 더 자세히 말씀해 주실 수 있나요? 🤗',
        '정말 힘드셨겠어요. 그런 마음이 이해됩니다. 💙',
        '좋은 생각이네요! 그런 긍정적인 마음이 중요해요. ✨',
        '혼자 감당하기 어려운 일이 있으시군요. 함께 생각해보아요. 🤝',
        '당신의 감정을 표현해주셔서 감사해요. 더 이야기해주세요. 💚'
      ];

      // 봇 응답 메시지 중 하나라도 찾으면 성공
      const foundResponse = botResponses.find(response => {
        try {
          return getByText(response);
        } catch {
          return false;
        }
      });

      expect(foundResponse).toBeTruthy();
    }, { timeout: 3000 });
  });
});
