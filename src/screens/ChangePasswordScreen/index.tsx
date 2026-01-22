import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Button, Input, Header } from '../../components/ui';
import { RootStackParamList } from '../../types/navigation';
import { useChangePasswordScreenContainer } from './ChangePasswordScreen.container';
import { styles } from './ChangePasswordScreen.styles';

interface ChangePasswordScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    oldPassword,
    newPassword,
    confirmPassword,
    isLoading,
    errors,
    handleOldPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleChangePassword,
  } = useChangePasswordScreenContainer({
    navigation,
  });

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Header title="비밀번호 변경" navigation={navigation} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.form}>
              {/* 현재 비밀번호 */}
              <View style={styles.inputContainer}>
                <Input
                  label="현재 비밀번호"
                  placeholder="현재 비밀번호를 입력하세요"
                  value={oldPassword}
                  onChangeText={handleOldPasswordChange}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  error={errors.oldPassword}
                  inputStyle={styles.inputText}
                />
              </View>

              {/* 새 비밀번호 */}
              <View style={styles.inputContainer}>
                <Input
                  label="새 비밀번호"
                  placeholder="8자 이상의 비밀번호를 입력하세요"
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  error={errors.newPassword}
                  inputStyle={styles.inputText}
                />
              </View>

              {/* 새 비밀번호 확인 */}
              <View style={styles.inputContainer}>
                <Input
                  label="새 비밀번호 확인"
                  placeholder="새 비밀번호를 한 번 더 입력하세요"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                  error={errors.confirmPassword}
                  inputStyle={styles.inputText}
                />
              </View>

              {/* 변경 버튼 */}
              <View style={styles.buttonContainer}>
                <Button
                  title="비밀번호 변경"
                  onPress={handleChangePassword}
                  variant="primary"
                  size="lg"
                  disabled={isLoading}
                  loading={isLoading}
                  style={styles.changeButton}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default ChangePasswordScreen;
