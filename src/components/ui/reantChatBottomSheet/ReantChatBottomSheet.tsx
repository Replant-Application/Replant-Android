/**
 * 리앤트 채팅 바텀시트 컴포넌트
 * 홈화면에서 리앤트와 채팅할 수 있는 바텀시트 UI
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { ChatMessage } from '../../../utils/reantChatUtils';
import { colors } from '../../../utils/designTokens';
import { styles } from './ReantChatBottomSheet.styles';

interface ReantChatBottomSheetProps {
  visible: boolean;
  messages: ChatMessage[];
  onClose: () => void;
  onSendMessage: (message: string) => void;
  reantName?: string;
}

const ReantChatBottomSheet: React.FC<ReantChatBottomSheetProps> = ({
  visible,
  messages,
  onClose,
  onSendMessage,
  reantName = '리앤트',
}) => {
  const [inputText, setInputText] = React.useState('');
  const flatListRef = useRef<FlatList>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    // 사용자 메시지만 표시 (리앤트 응답은 말풍선에만 표시)
    if (item.type === 'user') {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessageBubble}>
            <Text style={styles.userMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }
    // 리앤트 메시지는 채팅창에 표시하지 않음
    return null;
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} accessibilityRole="none" accessibilityLabel="">
            {/* 드래그 핸들 */}
            <View style={styles.dragHandle}>
              <View style={styles.dragHandleBar} />
            </View>

            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.headerTitle} accessibilityRole="header">{reantName}와 대화하기</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="닫기">
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 메시지 리스트 */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.messagesContainer}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                  styles.messagesList,
                  messages.length === 0 && styles.messagesListEmpty,
                ]}
                showsVerticalScrollIndicator={false}
                scrollEnabled={messages.length > 1}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {reantName}에게 메시지를 보내보세요!
                    </Text>
                  </View>
                }
              />
            </KeyboardAvoidingView>

            {/* 입력창 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                maxLength={200}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim()}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="전송"
              >
                <Text style={styles.sendButtonText}>전송</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ReantChatBottomSheet;
