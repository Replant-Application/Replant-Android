/**
 * SignUpScreen 타입 정의
 */

export interface SignUpScreenProps {
  onNavigate: (screen: string) => void;
}

export type Gender = 'MALE' | 'FEMALE';

export interface SignUpErrors {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  phone: string;
  verificationCode: string;
  gender: string;
  region: string;
  birthYear: string;
}
