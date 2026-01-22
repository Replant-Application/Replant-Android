/**
 * UpdateModal
 * 앱 업데이트 알림 모달 컴포넌트
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { styles } from './UpdateModal.styles';

interface UpdateModalProps {
  visible: boolean;
  isRequired: boolean; // 강제 업데이트 여부
  message: string; // 업데이트 안내 메시지
  onUpdate: () => void; // 업데이트 버튼 클릭
  onClose?: () => void; // 선택 업데이트일 때만 닫기 가능
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  isRequired,
  message,
  onUpdate,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isRequired ? undefined : onClose} // 강제 업데이트면 닫기 불가
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>업데이트 알림</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {!isRequired && onClose && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>나중에</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={onUpdate}
            >
              <Text style={styles.updateButtonText}>업데이트</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;
