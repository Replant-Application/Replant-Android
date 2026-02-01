import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import { Header, Card } from '../../components/ui';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { styles } from './CounselingSelectScreen.styles';

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
      accessibilityElementsHidden={true}
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
                accessibilityRole="button"
                accessibilityLabel="상담 센터 찾기"
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

export default CounselingSelectScreen;
