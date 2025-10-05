/**
 * 카카오맵 API 서비스
 * 심리상담센터 및 은둔형 외톨이 관련 기관 검색
 */

import { KAKAO_MAP_API_KEY, HAS_KAKAO_API_KEY } from '../config/api';

// API 키가 설정되지 않은 경우를 위한 플래그
const HAS_API_KEY = HAS_KAKAO_API_KEY;

// Google Places API 키 (환경변수에서 가져오거나 기본값 사용)
const GOOGLE_PLACES_API_KEY = 'your-google-places-api-key';

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

export interface PlacesSearchResult {
  results: Place[];
  status: string;
  next_page_token?: string;
}

class PlacesService {
  private baseUrl = 'https://dapi.kakao.com/v2/local';

  /**
   * 심리상담센터 검색 (카카오맵 API)
   */
  async searchCounselingCenters(location: string, radius: number = 5000): Promise<Place[]> {
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

  /**
   * 은둔형 외톨이 관련 기관 검색 (카카오맵 API)
   */
  async searchHikikomoriSupport(location: string, radius: number = 5000): Promise<Place[]> {
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

  /**
   * 카카오맵 API로 장소 검색
   */
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

  /**
   * 카카오맵 API 응답을 Place 인터페이스로 변환
   */
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
      user_ratings_total: kakaoDoc.review_count ? parseInt(kakaoDoc.review_count) : undefined,
      formatted_phone_number: kakaoDoc.phone,
      website: kakaoDoc.place_url,
      types: [kakaoDoc.category_name],
      opening_hours: kakaoDoc.open_hours ? {
        open_now: kakaoDoc.open_hours === '영업중',
        weekday_text: [kakaoDoc.open_hours]
      } : undefined
    };
  }

  /**
   * 근처 장소 검색 (위도/경도 기반)
   */
  async searchNearby(lat: number, lng: number, type: string, radius: number = 5000): Promise<Place[]> {
    try {
      const url = `${this.baseUrl}/nearbysearch/json`;
      const params = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: radius.toString(),
        type: type,
        key: GOOGLE_PLACES_API_KEY,
        language: 'ko'
      });

      const response = await fetch(`${url}?${params}`);
      const data: PlacesSearchResult = await response.json();

      if (data.status === 'OK') {
        return data.results;
      } else {
        console.error('Nearby Search API 오류:', data.status);
        return [];
      }
    } catch (error) {
      console.error('Nearby Search API 요청 오류:', error);
      return [];
    }
  }

  /**
   * 장소 상세 정보 가져오기
   */
  async getPlaceDetails(placeId: string): Promise<Place | null> {
    try {
      const url = `${this.baseUrl}/details/json`;
      const params = new URLSearchParams({
        place_id: placeId,
        fields: 'place_id,name,formatted_address,geometry,rating,user_ratings_total,opening_hours,formatted_phone_number,website,types',
        key: GOOGLE_PLACES_API_KEY,
        language: 'ko'
      });

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.result;
      } else {
        console.error('Place Details API 오류:', data.status);
        return null;
      }
    } catch (error) {
      console.error('Place Details API 요청 오류:', error);
      return null;
    }
  }

  /**
   * 사용자 위치 기반 검색 (카카오맵 API)
   */
  async searchByUserLocation(
    userLat: number,
    userLng: number,
    searchTypes: string[] = ['counseling', 'mental_health', 'social_services']
  ): Promise<Place[]> {
    // API 키가 없으면 샘플 데이터 반환
    if (!HAS_API_KEY) {
      console.log('카카오맵 API 키가 설정되지 않았습니다. 샘플 데이터를 반환합니다.');
      return this.getSamplePlaces(userLat, userLng);
    }

    try {
      const allResults: Place[] = [];

      // 위치를 주소로 변환 (간단한 방법으로 서울 중심으로 설정)
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

        // 관련 키워드가 포함된 장소만 필터링
        const filteredPlaces = places.filter(place =>
          this.isRelevantPlace(place, type)
        );

        allResults.push(...filteredPlaces);
      }

      // 중복 제거 및 거리순 정렬
      const uniqueResults = this.removeDuplicates(allResults);
      return this.sortByDistance(uniqueResults, userLat, userLng);
    } catch (error) {
      console.error('사용자 위치 기반 검색 오류:', error);
      // 오류 발생 시 샘플 데이터 반환
      return this.getSamplePlaces(userLat, userLng);
    }
  }

  /**
   * 관련 장소인지 확인
   */
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

  /**
   * 중복 제거
   */
  private removeDuplicates(places: Place[]): Place[] {
    const seen = new Set();
    return places.filter(place => {
      if (seen.has(place.place_id)) {
        return false;
      }
      seen.add(place.place_id);
      return true;
    });
  }

  /**
   * 거리순 정렬
   */
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

  /**
   * 두 지점 간 거리 계산 (km)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 지구 반지름 (km)
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

  /**
   * 샘플 데이터 생성 (API 키가 없을 때 사용)
   */
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

    // 거리순으로 정렬
    return this.sortByDistance(samplePlaces, userLat, userLng);
  }
}

export default new PlacesService();
