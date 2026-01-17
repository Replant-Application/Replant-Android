import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
  Image,
} from 'react-native';
import { Header, Card } from '../../components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';

interface CounselingSelectScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

const CounselingSelectScreen: React.FC<CounselingSelectScreenProps> = ({ navigation }) => {
  // 근처 상담센터 찾기
  const handleFindCenter = () => {
    navigation.navigate('PlacesSearch');
  };


  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header title="상담 서비스" navigation={navigation} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>여러분의 쉼터가 되어줄게요</Text>
            <Text style={styles.subtitle}>어떤 도움이 필요하신가요?</Text>

            {/* 근처 상담센터 찾기 카드 */}
            <Card style={styles.counselingCard}>
              <TouchableOpacity
                style={styles.counselingCardContent}
                onPress={handleFindCenter}
                activeOpacity={0.7}
              >
                <View style={styles.cardIcon}>
                  <Image
                    source={require('../../assets/images/hospital.png')}
                    style={styles.cardIconImage}
                    resizeMode="contain"
                    accessibilityLabel="병원 아이콘"
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>근처 상담센터 찾기</Text>
                  <Text style={styles.cardDescription}>주변 상담센터를 찾아보세요.</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Image
                    source={require('../../assets/images/chevron.png')}
                    style={styles.arrowIcon}
                    resizeMode="contain"
                    accessibilityLabel="화살표 아이콘"
                  />
                </View>
              </TouchableOpacity>
            </Card>

            {/* 추가 정보 */}
            <Card style={styles.infoCard}>
              <Text style={styles.infoTitle}>상담 서비스 안내</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>모든 상담은 익명으로 진행됩니다</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>개인정보는 안전하게 보호됩니다</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>언제든 상담을 중단할 수 있습니다</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>전문 상담사가 도움을 드립니다</Text>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  backButtonIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  content: {
    padding: spacing[5],
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.xxl),
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  counselingCard: {
    marginBottom: spacing[5],
  },
  counselingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[1],
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    borderWidth: 2,
    borderColor: '#D4A574',
    ...shadows.sm,
  },
  cardIconImage: {
    width: 32,
    height: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  cardArrow: {
    marginLeft: spacing[2],
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  infoCard: {
    marginTop: spacing[2],
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginBottom: spacing[3],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.base),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  infoBullet: {
    fontSize: typography.fontSize.sm,
    color: '#8B6F47',
    marginRight: spacing[2],
    marginTop: 2,
    fontWeight: typography.fontWeight.medium as any,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});

export default CounselingSelectScreen;
