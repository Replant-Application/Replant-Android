import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Place } from '../../services/placesService';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/designTokens';
import { getOptimizedLineHeight } from '../../utils/textStyles';

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
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {place.rating.toFixed(1)}</Text>
            {place.user_ratings_total && (
              <Text style={styles.ratingCount}>({place.user_ratings_total})</Text>
            )}
          </View>
        )}
      </View>

      <Text style={styles.address}>📍 {place.formatted_address}</Text>

      {place.formatted_phone_number && (
        <Text style={styles.phone}>📞 {place.formatted_phone_number}</Text>
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
          <TouchableOpacity style={styles.button} onPress={handleCall}>
            <Text style={styles.buttonText}>전화</Text>
          </TouchableOpacity>
        )}
        {place.website && (
          <TouchableOpacity style={styles.button} onPress={handleWebsite}>
            <Text style={styles.buttonText}>웹사이트</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.base,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  name: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.lg),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: typography.fontSize.sm,
    color: colors.warning[600],
    fontWeight: typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  ratingCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  address: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  phone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  hoursContainer: {
    marginBottom: spacing[3],
  },
  openStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
  open: {
    color: colors.success[600],
  },
  closed: {
    color: colors.error[600],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: Platform.select({
      ios: typography.fontFamily.regular,
      android: typography.fontFamily.regular,
    }),
    includeFontPadding: false,
    lineHeight: getOptimizedLineHeight(typography.fontSize.sm),
  },
});
