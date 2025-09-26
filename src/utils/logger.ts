/**
 * 통합 로깅 시스템
 * 개발/프로덕션 환경별 로깅 관리
 */

import { Platform } from 'react-native';

// 환경 설정
const isDevelopment: boolean = __DEV__;
const isProduction: boolean = !isDevelopment;

/**
 * 로그 레벨 정의
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const;

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

/**
 * 현재 로그 레벨 (개발: DEBUG, 프로덕션: ERROR)
 */
let currentLogLevel: LogLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * 로그 데이터 타입
 */
interface LogData {
  [key: string]: any;
}

/**
 * 에러 데이터 타입
 */
interface ErrorData {
  message: string;
  stack?: string;
  context: LogData;
}

/**
 * 성능 데이터 타입
 */
interface PerformanceData {
  operation: string;
  duration: string;
  [key: string]: any;
}

/**
 * API 호출 데이터 타입
 */
interface ApiCallData {
  endpoint: string;
  method: string;
  status: number;
  duration: string;
  [key: string]: any;
}

/**
 * 로그 포맷터
 */
const formatLogMessage = (
  level: string, 
  message: string, 
  data: LogData | null = null
): string => {
  const timestamp: string = new Date().toISOString();
  const platform: string = Platform.OS;
  
  const baseMessage: string = `[${timestamp}] [${platform}] [${level}] ${message}`;
  
  if (data) {
    return `${baseMessage}\nData: ${JSON.stringify(data, null, 2)}`;
  }
  
  return baseMessage;
};

/**
 * 로그 출력 함수
 */
const log = (
  level: LogLevel, 
  levelName: string, 
  message: string, 
  data: LogData | null = null
): void => {
  if (level <= currentLogLevel) {
    const formattedMessage: string = formatLogMessage(levelName, message, data);
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage);
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage);
        break;
      case LOG_LEVELS.DEBUG:
        console.log(formattedMessage);
        break;
    }
  }
};

/**
 * 에러 로깅
 */
export const logError = (
  message: string, 
  error: Error | null = null, 
  context: LogData = {}
): void => {
  const errorData: ErrorData = {
    message: error?.message || message,
    stack: error?.stack,
    context,
  };
  
  log(LOG_LEVELS.ERROR, 'ERROR', message, errorData);
};

/**
 * 경고 로깅
 */
export const logWarn = (message: string, data: LogData | null = null): void => {
  log(LOG_LEVELS.WARN, 'WARN', message, data);
};

/**
 * 정보 로깅
 */
export const logInfo = (message: string, data: LogData | null = null): void => {
  log(LOG_LEVELS.INFO, 'INFO', message, data);
};

/**
 * 디버그 로깅 (개발 환경에서만)
 */
export const logDebug = (message: string, data: LogData | null = null): void => {
  log(LOG_LEVELS.DEBUG, 'DEBUG', message, data);
};

/**
 * 성능 로깅
 */
export const logPerformance = (
  operation: string, 
  startTime: number, 
  endTime: number, 
  data: LogData = {}
): void => {
  const duration: number = endTime - startTime;
  const performanceData: PerformanceData = {
    operation,
    duration: `${duration}ms`,
    ...data,
  };
  
  if (duration > 1000) {
    logWarn(`Slow operation: ${operation}`, performanceData);
  } else {
    logDebug(`Performance: ${operation}`, performanceData);
  }
};

/**
 * 사용자 액션 로깅
 */
export const logUserAction = (action: string, data: LogData = {}): void => {
  const actionData: LogData = {
    action,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  logInfo(`User Action: ${action}`, actionData);
};

/**
 * API 호출 로깅
 */
export const logApiCall = (
  endpoint: string, 
  method: string, 
  status: number, 
  duration: number, 
  data: LogData = {}
): void => {
  const apiData: ApiCallData = {
    endpoint,
    method,
    status,
    duration: `${duration}ms`,
    ...data,
  };
  
  if (status >= 400) {
    logError(`API Error: ${method} ${endpoint}`, null, apiData);
  } else {
    logDebug(`API Call: ${method} ${endpoint}`, apiData);
  }
};

/**
 * 성능 측정 래퍼
 */
export const measurePerformance = async <T>(
  operation: string, 
  asyncFunction: () => Promise<T>, 
  data: LogData = {}
): Promise<T> => {
  const startTime: number = Date.now();
  
  try {
    const result: T = await asyncFunction();
    const endTime: number = Date.now();
    
    logPerformance(operation, startTime, endTime, data);
    
    return result;
  } catch (error) {
    const endTime: number = Date.now();
    
    logError(`Performance measurement failed: ${operation}`, error as Error, {
      ...data,
      duration: `${endTime - startTime}ms`,
    });
    
    throw error;
  }
};

/**
 * 로그 레벨 설정 (개발용)
 */
export const setLogLevel = (level: LogLevel): void => {
  if (isDevelopment) {
    currentLogLevel = level;
    logInfo('Log level changed', { newLevel: level });
  }
};

/**
 * 로그 초기화
 */
export const initializeLogger = (): void => {
  logInfo('Logger initialized', {
    environment: isDevelopment ? 'development' : 'production',
    logLevel: currentLogLevel,
  });
};
