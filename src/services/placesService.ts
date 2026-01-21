import { KAKAO_MAP_API_KEY, HAS_KAKAO_API_KEY } from '../config/api';
import { removeDuplicates } from '../utils/arrayUtils';

const HAS_API_KEY = HAS_KAKAO_API_KEY;

export interface Place {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  types: string[];
}

class PlacesService {
  private baseUrl = 'https://dapi.kakao.com/v2/local';

  async searchCounselingCenters(location: string): Promise<Place[]> {
    try {
      const queries = ['심리상담센터', '상담센터', '정신건강복지센터'];
      const allResults: Place[] = [];

      for (const query of queries) {
        const results = await this.searchKakaoPlaces(query, location);
        allResults.push(...results);
      }

      return this.removeDuplicates(allResults);
    } catch (error) {
      console.error('심리상담센터 검색 오류:', error);
      return [];
    }
  }

  async searchHikikomoriSupport(location: string): Promise<Place[]> {
    try {
      const queries = ['청소년상담복지센터', '사회복지관', '사회복귀지원'];
      const allResults: Place[] = [];

      for (const query of queries) {
        const results = await this.searchKakaoPlaces(query, location);
        allResults.push(...results);
      }

      return this.removeDuplicates(allResults);
    } catch (error) {
      console.error('은둔형 외톨이 지원 기관 검색 오류:', error);
      return [];
    }
  }

  async searchKakaoPlaces(query: string, location: string): Promise<Place[]> {
    try {
      const url = `${this.baseUrl}/search/keyword.json`;
      const params = new URLSearchParams({
        query: `${query} ${location}`,
        size: '15'
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `KakaoAK ${KAKAO_MAP_API_KEY}`,
          'KA': 'sdk/1.0 os/javascript origin/localhost',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        }
      });

      const data = await response.json();

      if (data.documents) {
        return data.documents.map((doc: any) => this.convertKakaoToPlace(doc));
      } else {
        console.error('카카오맵 API 오류:', data);
        return [];
      }
    } catch (error) {
      console.error('카카오맵 API 요청 오류:', error);
      return [];
    }
  }

  private convertKakaoToPlace(kakaoDoc: any): Place {
    return {
      place_id: kakaoDoc.id,
      name: kakaoDoc.place_name,
      formatted_address: kakaoDoc.address_name,
      geometry: {
        location: {
          lat: parseFloat(kakaoDoc.y),
          lng: parseFloat(kakaoDoc.x)
        }
      },
      rating: kakaoDoc.rating ? parseFloat(kakaoDoc.rating) : undefined,
      user_ratings_total: kakaoDoc.review_count ? parseInt(kakaoDoc.review_count, 10) : undefined,
      formatted_phone_number: kakaoDoc.phone,
      website: kakaoDoc.place_url,
      types: [kakaoDoc.category_name],
      opening_hours: kakaoDoc.open_hours ? {
        open_now: kakaoDoc.open_hours === '영업중',
        weekday_text: [kakaoDoc.open_hours]
      } : undefined
    };
  }

  async searchByUserLocation(
    userLat: number,
    userLng: number,
    searchTypes: string[] = ['counseling', 'mental_health', 'social_services']
  ): Promise<Place[]> {
    if (!HAS_API_KEY) {
      console.log('카카오맵 API 키가 설정되지 않았습니다. 샘플 데이터를 반환합니다.');
      return this.getSamplePlaces(userLat, userLng);
    }

    try {
      const allResults: Place[] = [];
      const location = '서울';

      for (const type of searchTypes) {
        let places: Place[] = [];

        switch (type) {
          case 'counseling':
            places = await this.searchCounselingCenters(location);
            break;
          case 'mental_health':
            places = await this.searchKakaoPlaces('정신건강', location);
            break;
          case 'social_services':
            places = await this.searchHikikomoriSupport(location);
            break;
        }

        const filteredPlaces = places.filter(place =>
          this.isRelevantPlace(place, type)
        );

        allResults.push(...filteredPlaces);
      }

      const uniqueResults = this.removeDuplicates(allResults);
      return this.sortByDistance(uniqueResults, userLat, userLng);
    } catch (error) {
      console.error('사용자 위치 기반 검색 오류:', error);
      return this.getSamplePlaces(userLat, userLng);
    }
  }

  private isRelevantPlace(place: Place, type: string): boolean {
    const relevantKeywords: { [key: string]: string[] } = {
      counseling: ['상담', '심리', '정신건강', '복지', '센터'],
      mental_health: ['정신', '심리', '상담', '치료', '병원'],
      social_services: ['복지', '상담', '지원', '센터', '청소년']
    };

    const keywords = relevantKeywords[type] || [];
    const searchText = `${place.name} ${place.formatted_address}`.toLowerCase();

    return keywords.some((keyword: string) => searchText.includes(keyword));
  }

  private removeDuplicates(places: Place[]): Place[] {
    return removeDuplicates(places, place => place.place_id);
  }

  private sortByDistance(places: Place[], userLat: number, userLng: number): Place[] {
    return places.sort((a, b) => {
      const distanceA = this.calculateDistance(
        userLat, userLng,
        a.geometry.location.lat, a.geometry.location.lng
      );
      const distanceB = this.calculateDistance(
        userLat, userLng,
        b.geometry.location.lat, b.geometry.location.lng
      );
      return distanceA - distanceB;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private getSamplePlaces(userLat: number, userLng: number): Place[] {
    const samplePlaces: Place[] = [
      {
        place_id: 'sample_1',
        name: '서울시 정신건강복지센터',
        formatted_address: '서울시 강남구 테헤란로 123',
        geometry: {
          location: {
            lat: userLat + 0.01,
            lng: userLng + 0.01
          }
        },
        rating: 4.5,
        user_ratings_total: 128,
        formatted_phone_number: '02-1234-5678',
        website: 'https://www.mohw.go.kr',
        types: ['health', 'establishment', 'counseling'],
        opening_hours: {
          open_now: true,
          weekday_text: [
            '월요일: 09:00-18:00',
            '화요일: 09:00-18:00',
            '수요일: 09:00-18:00',
            '목요일: 09:00-18:00',
            '금요일: 09:00-18:00',
            '토요일: 09:00-13:00',
            '일요일: 휴무'
          ]
        }
      },
      {
        place_id: 'sample_2',
        name: '강남구 심리상담센터',
        formatted_address: '서울시 강남구 역삼동 456',
        geometry: {
          location: {
            lat: userLat - 0.005,
            lng: userLng + 0.008
          }
        },
        rating: 4.2,
        user_ratings_total: 89,
        formatted_phone_number: '02-2345-6789',
        website: 'https://www.counseling.kr',
        types: ['health', 'establishment'],
        opening_hours: {
          open_now: true,
          weekday_text: [
            '월요일: 09:00-18:00',
            '화요일: 09:00-18:00',
            '수요일: 09:00-18:00',
            '목요일: 09:00-18:00',
            '금요일: 09:00-18:00',
            '토요일: 휴무',
            '일요일: 휴무'
          ]
        }
      },
      {
        place_id: 'sample_3',
        name: '서울시 청소년상담복지센터',
        formatted_address: '서울시 서초구 서초대로 789',
        geometry: {
          location: {
            lat: userLat + 0.008,
            lng: userLng - 0.012
          }
        },
        rating: 4.7,
        user_ratings_total: 156,
        formatted_phone_number: '02-3456-7890',
        website: 'https://www.youth.kr',
        types: ['establishment', 'point_of_interest'],
        opening_hours: {
          open_now: false,
          weekday_text: [
            '월요일: 09:00-18:00',
            '화요일: 09:00-18:00',
            '수요일: 09:00-18:00',
            '목요일: 09:00-18:00',
            '금요일: 09:00-18:00',
            '토요일: 09:00-13:00',
            '일요일: 휴무'
          ]
        }
      },
      {
        place_id: 'sample_4',
        name: '한국심리상담센터',
        formatted_address: '서울시 송파구 올림픽로 101',
        geometry: {
          location: {
            lat: userLat - 0.015,
            lng: userLng - 0.005
          }
        },
        rating: 4.3,
        user_ratings_total: 203,
        formatted_phone_number: '02-4567-8901',
        website: 'https://www.korean-counseling.kr',
        types: ['health', 'establishment'],
        opening_hours: {
          open_now: true,
          weekday_text: [
            '월요일: 09:00-19:00',
            '화요일: 09:00-19:00',
            '수요일: 09:00-19:00',
            '목요일: 09:00-19:00',
            '금요일: 09:00-19:00',
            '토요일: 09:00-15:00',
            '일요일: 휴무'
          ]
        }
      },
      {
        place_id: 'sample_5',
        name: '서울시 사회복지관',
        formatted_address: '서울시 마포구 홍대입구역 202',
        geometry: {
          location: {
            lat: userLat + 0.012,
            lng: userLng + 0.015
          }
        },
        rating: 4.1,
        user_ratings_total: 67,
        formatted_phone_number: '02-5678-9012',
        website: 'https://www.social-welfare.kr',
        types: ['establishment', 'point_of_interest'],
        opening_hours: {
          open_now: true,
          weekday_text: [
            '월요일: 09:00-18:00',
            '화요일: 09:00-18:00',
            '수요일: 09:00-18:00',
            '목요일: 09:00-18:00',
            '금요일: 09:00-18:00',
            '토요일: 09:00-13:00',
            '일요일: 휴무'
          ]
        }
      }
    ];

    return this.sortByDistance(samplePlaces, userLat, userLng);
  }
}

export default new PlacesService();
