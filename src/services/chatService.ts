// import OpenAI from 'openai';

import { OPENAI_API_KEY, OPENAI_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  emotion?: string;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

class ChatService {
  // private client: OpenAI;
  // private model: string;
  // private supabaseUrl: string;
  // private supabaseAnonKey: string;

  constructor() {
    // this.client = new OpenAI({
    //   baseURL: OPENAI_BASE_URL,
    //   apiKey: OPENAI_API_KEY,
    // });
    // this.model = '';
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    // API 호출 부분을 주석처리하고 fallback 응답만 사용
    try {
      // const completion = await this.client.chat.completions.create({
      //   model: this.model,
      //   messages: [{ role: 'user', content: message }],
      //   temperature: 0.7,
      //   response_format: { type: 'json_object' },
      // });

      // const outputStr = completion.choices[0].message.content;

      // if (outputStr) {
      //   // Assuming the model returns a JSON string like {"message": "..."}
      //   const parsedData = JSON.parse(outputStr);
      //   return {
      //     message: parsedData.message || '응답에서 메시지를 찾을 수 없습니다.',
      //   };
      // } else {
      //   throw new Error('응답이 비어있습니다.');
      // }

      // 임시로 fallback 응답만 사용
      return {
        message: this.getFallbackResponse(message)
      };
    } catch (error) {
      console.error('Chat API Error:', error);

      return {
        message: this.getFallbackResponse(message),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getFallbackResponse(userMessage: string): string {
    const responses = [
      '그렇게 생각하시는군요. 더 자세히 말씀해 주실 수 있나요? 🤗',
      '정말 힘드셨겠어요. 그런 마음이 이해됩니다. 💙',
      '좋은 생각이네요! 그런 긍정적인 마음이 중요해요. ✨',
      '혼자 감당하기 어려운 일이 있으시군요. 함께 생각해보아요. 🤝',
      '당신의 감정을 표현해주셔서 감사해요. 더 이야기해주세요. 💚'
    ];

    if (userMessage.includes('슬프') || userMessage.includes('우울')) {
      return '마음이 많이 힘드시군요. 그런 감정을 느끼는 것은 자연스러운 일이에요. 혼자가 아니라는 것을 기억해 주세���. 💙';
    }

    if (userMessage.includes('기쁘') || userMessage.includes('좋')) {
      return '기분이 좋으시다니 정말 다행이에요! 그 긍정적인 에너지를 계속 유지하시길 바라요. ✨';
    }

    if (userMessage.includes('스트레스') || userMessage.includes('힘들')) {
      return '스트레스가 많으시군요. 깊게 숨을 들이마시고 천천히 내쉬어보세요. 작은 휴식도 큰 도움이 될 거예요. 🌸';
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const chatService = new ChatService();
