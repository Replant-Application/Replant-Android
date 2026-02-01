import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
} from 'react-native';
import { Button, Header, SectionTitle, FormCard, AlertModal } from '../../components/ui';
import { colors, spacing } from '../../utils/designTokens';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useCustomMissionCreateScreenContainer } from './CustomMissionCreateScreen.container';
import { styles } from './CustomMissionCreateScreen.styles';

interface CustomMissionCreateScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route?: RouteProp<RootStackParamList, 'CustomMissionCreate'>;
}

const CustomMissionCreateScreen: React.FC<CustomMissionCreateScreenProps> = ({ navigation, route }) => {
  // 비즈니스 로직은 Container에서 처리
  const {
    isEditMode,
    title,
    description,
    loading,
    category,
    alertModal,
    setTitle,
    setDescription,
    setCategory,
    handleSubmitMission,
    handleCancel,
    handleAlertClose,
    MISSION_CATEGORY_OPTIONS: categoryOptions,
  } = useCustomMissionCreateScreenContainer({ navigation, route });

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <Header
          title={isEditMode ? "미션 수정" : "미션 만들기"}
          leftButton={
            <TouchableOpacity
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
            >
              <Image
                source={require('../../assets/images/left.png')}
                style={styles.backButtonIcon}
                resizeMode="contain"
                accessibilityLabel="뒤로 가기"
                accessibilityElementsHidden={true}
              />
            </TouchableOpacity>
          }
        />

        <ScrollView style={styles.content}>
          <FormCard>
            <SectionTitle title="미션 제목" size="lg" marginBottom={spacing[3]} />
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="미션 제목을 입력하세요"
              placeholderTextColor={colors.text.secondary}
              maxLength={50}
            />
          </FormCard>

          <FormCard>
            <SectionTitle title="미션 설명" size="lg" marginBottom={spacing[3]} />
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="미션 설명을 입력하세요"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </FormCard>

          <FormCard>
            <View style={styles.titleRow}>
              <Text style={styles.categoryTitle}>미션 카테고리</Text>
              <Text style={styles.optionalHintInline}>(선택 사항)</Text>
            </View>
            <View style={styles.worryTypeContainer}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.worryTypeButton,
                    category === option.id && styles.selectedWorryType
                  ]}
                  onPress={() => setCategory(category === option.id ? null : option.id)}
                  accessibilityRole="button"
                  accessibilityLabel={option.name}
                  accessibilityState={{ selected: category === option.id }}
                >
                  <Text style={styles.worryTypeEmoji} accessibilityElementsHidden={true}>{option.emoji}</Text>
                  <Text style={[
                    styles.worryTypeText,
                    category === option.id && styles.selectedWorryTypeText
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormCard>
        </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="취소"
          onPress={handleCancel}
          style={StyleSheet.flatten([styles.button, styles.cancelButton])}
          textStyle={styles.cancelButtonText}
        />
        <Button
          title={loading ? (isEditMode ? '수정 중...' : '생성 중...') : isEditMode ? '미션 수정' : '미션 생성'}
          onPress={handleSubmitMission}
          style={StyleSheet.flatten([styles.button, styles.createButton])}
          disabled={loading}
        />
      </View>
      </KeyboardAvoidingView>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttonText="확인"
        onClose={handleAlertClose}
      />
    </ImageBackground>
  );
};


export default CustomMissionCreateScreen;
