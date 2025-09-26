import AsyncStorage from '@react-native-async-storage/async-storage';
import { logError } from '../utils/logger';
import { StorageKeys, GetData, SetData, GetStorageKeys } from '../types/storage';

// 로컬 저장소 키 상수
export const STORAGE_KEYS: StorageKeys = {
  USER: 'user',
  MISSIONS: 'missions',
  DIARIES: 'diaries',
  CHARACTERS: 'characters',
  SETTINGS: 'settings',
  PREFERENCES: 'preferences',
  USER_NICKNAME: 'userNickname',
  MISSION_TEMPLATES: 'mission_templates',
  CHARACTER_TEMPLATES: 'character_templates',
  REPRESENTATIVE_CHARACTER: 'representative_character',
} as const;

// 사용자별 스토리지 키 생성 함수
export const getStorageKeys = (nickname: string): StorageKeys => {
  return {
    USER: `user_${nickname}`,
    MISSIONS: `missions_${nickname}`,
    DIARIES: `diaries_${nickname}`,
    CHARACTERS: `characters_${nickname}`,
    SETTINGS: `settings_${nickname}`,
    PREFERENCES: `preferences_${nickname}`,
    USER_NICKNAME: `userNickname_${nickname}`,
    MISSION_TEMPLATES: 'mission_templates', // 템플릿은 공유
    CHARACTER_TEMPLATES: 'character_templates', // 템플릿은 공유
    REPRESENTATIVE_CHARACTER: `representative_character_${nickname}`,
  };
};

// 기본 CRUD 함수들
export const getData: GetData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const data: string | null = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logError(`데이터 조회 실패 (${key})`, error as Error, { key });
    return null;
  }
};

export const setData: SetData = async <T = any>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logError(`데이터 저장 실패 (${key})`, error as Error, { key });
    throw error;
  }
};

export const addData = async <T extends { id?: number }>(
  key: string, 
  item: Omit<T, 'id'>
): Promise<T> => {
  try {
    const existingData: T[] = await getData(key) || [];
    const newItem: T = { ...item, id: Date.now() } as T;
    const newData: T[] = [...existingData, newItem];
    await setData(key, newData);
    return newItem;
  } catch (error) {
    logError(`데이터 추가 실패 (${key})`, error as Error, { key });
    throw error;
  }
};

export const updateData = async <T extends { id: number }>(
  key: string, 
  id: number, 
  updates: Partial<T>
): Promise<T | undefined> => {
  try {
    const existingData: T[] = await getData(key) || [];
    const updatedData: T[] = existingData.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    await setData(key, updatedData);
    return updatedData.find(item => item.id === id);
  } catch (error) {
    logError(`데이터 수정 실패 (${key})`, error as Error, { key, id });
    throw error;
  }
};

export const deleteData = async <T extends { id: number }>(
  key: string, 
  id: number
): Promise<boolean> => {
  try {
    const existingData: T[] = await getData(key) || [];
    const filteredData: T[] = existingData.filter(item => item.id !== id);
    await setData(key, filteredData);
    return true;
  } catch (error) {
    logError(`데이터 삭제 실패 (${key})`, error as Error, { key, id });
    throw error;
  }
};

// 기기별 데이터 삭제 함수
export const clearDeviceBasedData = async (): Promise<void> => {
  try {
    const deviceId: string = await getDeviceId();
    const keysToRemove: string[] = [
      `missions_${deviceId}`,
      `diaries_${deviceId}`,
      `characters_${deviceId}`,
      `userNickname_${deviceId}`,
    ];
    
    for (const key of keysToRemove) {
      await AsyncStorage.removeItem(key);
    }
    
  } catch (error) {
    logError('기기별 데이터 삭제 실패', error as Error);
  }
};

// 기기 ID 생성/조회
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId: string | null = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  } catch (error) {
    logError('Device ID 가져오기 실패', error as Error);
    return 'device_' + Math.random().toString(36).substr(2, 9);
  }
};
