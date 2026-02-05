/**
 * 관심 분야 선택 화면 (다중 선택)
 * 앱 첫 실행(로그인 후) 한 번 표시되며, 고른 분야의 미션이 매일 추천됩니다.
 * 설정 > 미션 카테고리 변경에서 나중에 수정 가능.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ImageBackground, Image, Alert, ScrollView } from 'react-native';
import { Header } from '../../components/ui';
import { useUser } from '../../contexts/UserContext';
import { updateMyInfo } from '../../api/userApi';
import type { MissionCategoryType } from '../../types';
import { colors } from '../../utils/designTokens';
import { styles, CATEGORY_OPTIONS, getCategoryLabel } from './CategorySelectScreen.styles';

const CATEGORY_ICONS: Record<string, number> = {
  DAILY_LIFE: require('../../assets/images/home.png'),
  GROWTH: require('../../assets/images/goal.png'),
  EXERCISE: require('../../assets/images/traning.png'),
  STUDY: require('../../assets/images/books.png'),
  HEALTH: require('../../assets/images/health.png'),
  RELATIONSHIP: require('../../assets/images/heart.png'),
};

interface CategorySelectScreenProps {
  onBack?: () => void;
  onComplete: () => void;
}

const CategorySelectScreen: React.FC<CategorySelectScreenProps> = ({ onBack, onComplete }) => {
  const { user, refreshUser } = useUser();
  const [selected, setSelected] = useState<MissionCategoryType[]>([]);
  const [loading, setLoading] = useState(false);

  // 기존 선택값 복원 (설정에서 들어온 경우, 서버에 저장된 값과 동기화)
  useEffect(() => {
    if (user?.preferredMissionCategories != null) {
      setSelected([...user.preferredMissionCategories]);
    }
  }, [user?.preferredMissionCategories]);

  const toggle = (key: MissionCategoryType) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === CATEGORY_OPTIONS.length) {
      setSelected([]);
    } else {
      setSelected([...CATEGORY_OPTIONS] as MissionCategoryType[]);
    }
  };

  const handleComplete = async () => {
    if (selected.length === 0 || loading) return;
    setLoading(true);
    try {
      const result = await updateMyInfo({ preferredMissionCategories: selected });
      if (result.success) {
        await refreshUser();
        onComplete();
      } else {
        Alert.alert(
          '저장 실패',
          result.error || '미션 카테고리 저장에 실패했습니다. 네트워크를 확인한 뒤 다시 시도해주세요.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={[styles.container, styles.containerTransparent]}
      resizeMode="cover"
      accessibilityElementsHidden={true}
    >
      <Header
        title="미션 카테고리 변경"
        showBackButton={!!onBack}
        navigation={onBack ? { goBack: onBack } : undefined}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          해당 분야의 미션이 매일 추천돼요.
        </Text>
        <View style={styles.categoryCard}>
          <View style={styles.list}>
            {CATEGORY_OPTIONS.map((key) => {
              const isSelected = selected.includes(key);
              const icon = CATEGORY_ICONS[key];
              return (
                <View key={key} style={styles.categoryButtonWrap}>
                  <TouchableOpacity
                    style={[styles.categoryButton, isSelected && styles.optionSelected]}
                    onPress={() => toggle(key)}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={`${getCategoryLabel(key)} 카테고리 ${isSelected ? '해제' : '선택'}`}
                    activeOpacity={0.7}
                  >
                    {icon != null && (
                      <Image source={icon} style={styles.categoryButtonIcon} resizeMode="contain" />
                    )}
                    <Text
                      style={[styles.categoryButtonText, isSelected && styles.optionTextSelected]}
                      numberOfLines={1}
                    >
                      {getCategoryLabel(key)}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          <View style={styles.selectAllSection}>
            <TouchableOpacity
              style={[
                styles.selectAllButton,
                selected.length === CATEGORY_OPTIONS.length && styles.optionSelected,
                loading && styles.selectAllButtonDisabled,
              ]}
              onPress={toggleSelectAll}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="모두 선택"
            >
              <Text style={[
                styles.categoryButtonText,
                selected.length === CATEGORY_OPTIONS.length && styles.optionTextSelected,
              ]}>
                모두 선택
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.completeButton, selected.length === 0 && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={selected.length === 0 || loading}
          accessibilityRole="button"
          accessibilityLabel="선택 완료"
        >
          <Text style={styles.completeButtonText}>
            선택 완료 ({selected.length}개)
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      )}
    </ImageBackground>
  );
};

export default CategorySelectScreen;
