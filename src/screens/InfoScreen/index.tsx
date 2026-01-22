import React from 'react';
import { View, Text, ScrollView, ImageBackground } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Header } from '../../components/ui';
import { styles } from './InfoScreen.styles';

interface InfoScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: {
    params: {
      title: string;
      content: string;
    };
  };
}

const InfoScreen: React.FC<InfoScreenProps> = ({ navigation, route }) => {
  const { title, content } = route.params || { title: '', content: '' };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          title={title}
          navigation={navigation}
          showBorder={false}
          titleStyle={styles.headerTitle}
        />
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{content}</Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default InfoScreen;
