import React from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { Place } from '../../services/placesService';
import { styles } from './PlaceCard.styles';

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const handleCall = () => {
    if (place.formatted_phone_number) {
      Linking.openURL(`tel:${place.formatted_phone_number}`);
    }
  };

  const handleWebsite = () => {
    if (place.website) {
      Linking.openURL(place.website);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{place.name}</Text>
        {place.rating && (
          <View style={styles.ratingContainer} accessibilityRole="text" accessibilityLabel={`평점 ${place.rating.toFixed(1)}점${place.user_ratings_total ? `, ${place.user_ratings_total}개 리뷰` : ''}`}>
            <Image
              source={require('../../assets/images/star.png')}
              style={styles.ratingIcon}
              resizeMode="contain"
              accessibilityElementsHidden={true}
            />
            <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
            {place.user_ratings_total && (
              <Text style={styles.ratingCount}>({place.user_ratings_total})</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.addressContainer} accessibilityRole="text" accessibilityLabel={`주소 ${place.formatted_address}`}>
        <Image
          source={require('../../assets/images/gps.png')}
          style={styles.addressIcon}
          resizeMode="contain"
          accessibilityElementsHidden={true}
        />
        <Text style={styles.address}>{place.formatted_address}</Text>
      </View>

      {place.formatted_phone_number && (
        <View style={styles.phoneContainer} accessibilityRole="text" accessibilityLabel={`전화번호 ${place.formatted_phone_number}`}>
          <Image
            source={require('../../assets/images/call.png')}
            style={styles.phoneIcon}
            resizeMode="contain"
            accessibilityElementsHidden={true}
          />
          <Text style={styles.phone}>{place.formatted_phone_number}</Text>
        </View>
      )}

      {place.opening_hours && (
        <View style={styles.hoursContainer}>
          <Text style={[
            styles.openStatus,
            place.opening_hours.open_now ? styles.open : styles.closed,
          ]}>
            {place.opening_hours.open_now ? '영업중' : '영업종료'}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {place.formatted_phone_number && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCall}
            accessibilityRole="button"
            accessibilityLabel={`${place.name}에 전화하기`}
          >
            <Text style={styles.buttonText}>전화</Text>
          </TouchableOpacity>
        )}
        {place.website && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleWebsite}
            accessibilityRole="button"
            accessibilityLabel={`${place.name} 웹사이트 열기`}
          >
            <Text style={styles.buttonText}>웹사이트</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
