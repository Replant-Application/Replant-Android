import { chatService } from '../../src/services/chatService';

describe('ChatService', () => {
  // Increase the timeout for all tests in this suite
  jest.setTimeout(30000); // 30 seconds

  it('should send a message and receive a response', async () => {
    const message = '당신의 이름은 무엇인가요';
    console.log(`Sending message: "${message}"`);

    const response = await chatService.sendMessage(message);

    console.log('Received response:', response);

    expect(response.message).not.toBeNull();
    expect(typeof response.message).toBe('string');
    expect(response.error).toBeUndefined();
  });
});