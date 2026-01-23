/**
 * 리앤트 채팅 유틸리티
 * 규칙 기반 응답 생성 (나중에 AI로 확장 가능)
 */

export interface ChatMessage {
  id: string;
  type: 'user' | 'reant';
  content: string;
  timestamp: Date;
}

/**
 * 규칙 기반 리앤트 응답 생성
 * @param userMessage 사용자 메시지
 * @param reantName 리앤트 이름
 * @param reantLevel 리앤트 레벨
 * @returns 리앤트 응답 메시지
 */
export const generateReantResponse = (
  userMessage: string,
  reantName: string = '리앤트',
  reantLevel: number = 1
): string => {
  const message = userMessage.toLowerCase().trim();

  // 인사말 패턴
  if (message.match(/안녕|하이|헬로|hi|hello|반가워|좋은.*아침|좋은.*저녁|좋은.*밤/)) {
    const greetings = [
      '안녕하세요! 오늘도 화이팅해요!',
      '반가워요! 함께 성장해요!',
      '안녕! 오늘도 힘내요!',
      '하이! 좋은 하루 보내요!',
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 미션 관련 패턴
  if (message.match(/미션|할일|투두|해야할|해야 할|해야할것|해야 할 것/)) {
    const missionResponses = [
      '오늘의 미션을 완료하러 가볼까요?',
      '미션을 하나씩 완료해나가요!',
      '할 일을 차근차근 해봐요!',
      '미션 완료하면 경험치를 받을 수 있어요!',
    ];
    return missionResponses[Math.floor(Math.random() * missionResponses.length)];
  }

  // 감정 표현 패턴
  if (message.match(/힘들|피곤|지쳤|어려워|어려워요|힘들어|피곤해|지쳤어/)) {
    const encouragementResponses = [
      '힘내세요! 함께 해요!',
      '조금만 더 화이팅이에요!',
      '괜찮아요, 천천히 해요!',
      '당신은 할 수 있어요!',
    ];
    return encouragementResponses[Math.floor(Math.random() * encouragementResponses.length)];
  }

  // 기쁨/행복 패턴
  if (message.match(/좋아|행복|기쁘|신나|즐거워|완료|끝냈|해냈/)) {
    const happyResponses = [
      '정말 좋아요! 계속 화이팅!',
      '완벽해요! 대단해요!',
      '기쁜 일이 있나봐요! 축하해요!',
      '좋은 일이 있으면 저도 기뻐요!',
    ];
    return happyResponses[Math.floor(Math.random() * happyResponses.length)];
  }

  // 질문 패턴
  if (message.match(/\?|뭐야|뭐지|어떻게|무엇|뭘|뭐를/)) {
    const questionResponses = [
      '무엇이든 물어보세요!',
      '도움이 필요하시면 말씀해요!',
      '궁금한 게 있으신가요?',
      '제가 도와드릴 수 있는 게 있나요?',
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }

  // 고마움 패턴
  if (message.match(/고마워|감사|고맙|thanks|thank/)) {
    const thanksResponses = [
      '천만에요! 언제든지 도와드릴게요!',
      '별말씀을요! 함께 성장해요!',
      '도움이 되어서 기뻐요!',
      '저도 고마워요!',
    ];
    return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
  }

  // 기본 응답 (랜덤)
  const defaultResponses = [
    '오늘도 화이팅해요!',
    '함께 성장해요!',
    '무엇이든 물어보세요!',
    '도움이 필요하시면 말씀해요!',
    '좋은 하루 보내요!',
    '꾸준히 하면 다 할 수 있어요!',
    '오늘도 수고하셨어요!',
    '조금씩이라도 꾸준히 해요!',
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

/**
 * 메시지 ID 생성
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
