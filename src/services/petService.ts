/**
 * 펫(캐릭터) 이미지 다운로드 서비스
 * 캐릭터 이미지를 기기 갤러리에 저장하는 기능
 */

import { ServiceResult } from '../types';
import { logError } from '../utils/logger';
import { Platform } from 'react-native';

/**
 * 펫 이미지 다운로드
 * 캐릭터 이미지를 기기 갤러리에 저장
 * 
 * @param imageRef - Image 컴포넌트의 ref
 * @param characterName - 캐릭터 이름 (파일명에 사용)
 * @param level - 캐릭터 레벨 (파일명에 사용)
 * @returns ServiceResult<void>
 */
export const downloadPetImage = async (
  imageRef: any,
  characterName: string,
  level: number
): Promise<ServiceResult<void>> => {
  try {
    // react-native-view-shot과 @react-native-camera-roll/camera-roll 필요
    // 라이브러리가 없으면 에러 처리
    let captureRef: any;
    let CameraRoll: any;

    try {
      captureRef = require('react-native-view-shot').captureRef;
      CameraRoll = require('@react-native-camera-roll/camera-roll').CameraRoll;
    } catch (requireError) {
      // 라이브러리가 설치되지 않은 경우
      return {
        success: false,
        error: '이미지 다운로드 기능을 사용하려면 다음 라이브러리가 필요합니다:\n- react-native-view-shot\n- @react-native-camera-roll/camera-roll\n\nnpm install react-native-view-shot @react-native-camera-roll/camera-roll',
      };
    }

    if (!imageRef || !imageRef.current) {
      return {
        success: false,
        error: '이미지 참조를 찾을 수 없습니다.',
      };
    }

    // 이미지 캡처
    const imageUri = await captureRef(imageRef.current, {
      format: 'png',
      quality: 1.0,
    });

    // 갤러리에 저장
    await CameraRoll.save(imageUri, {
      type: 'photo',
      album: 'Replant',
    });

    return {
      success: true,
    };
  } catch (error) {
    logError('펫 이미지 다운로드 실패', error as Error, { characterName, level });
    return {
      success: false,
      error: (error as Error).message || '이미지 다운로드에 실패했습니다.',
    };
  }
};

