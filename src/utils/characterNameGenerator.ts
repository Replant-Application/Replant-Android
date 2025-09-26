/**
 * 블리자드 스타일 캐릭터 이름 생성기
 * 형용사 + 명사 조합으로 랜덤한 캐릭터 이름 생성
 */

// 형용사 풀
const adjectives = [
  "꿈꾸는", "희망찬", "성장하는", "빛나는", "고요한", "따뜻한",
  "신비로운", "용감한", "자유로운", "순수한", "강인한", "지혜로운",
  "활발한", "평화로운", "열정적인", "차분한", "밝은", "깊은",
  "새로운", "오래된", "특별한", "소중한", "아름다운", "푸른"
];

// 명사 풀
const nouns = [
  "씨앗", "새싹", "나무", "꽃", "잎사귀", "햇살", "뿌리", "가지",
  "꿈", "희망", "성장", "빛", "평화", "자유", "지혜", "용기",
  "바람", "물", "땅", "하늘", "별", "달", "태양", "구름"
];

/**
 * 랜덤한 캐릭터 이름 생성
 * @returns 형용사 + 명사 조합의 캐릭터 이름
 */
export const generateCharacterName = (): string => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective} ${randomNoun}`;
};

/**
 * 특정 시드로 캐릭터 이름 생성 (일관성 보장)
 * @param seed 시드 값
 * @returns 시드 기반 캐릭터 이름
 */
export const generateCharacterNameWithSeed = (seed: number): string => {
  const adjectiveIndex = seed % adjectives.length;
  const nounIndex = (seed * 7) % nouns.length; // 다른 인덱스 생성

  return `${adjectives[adjectiveIndex]} ${nouns[nounIndex]}`;
};

/**
 * 사용자별 고유한 캐릭터 이름 생성
 * @param userId 사용자 ID
 * @param categoryId 카테고리 ID
 * @returns 사용자별 고유 캐릭터 이름
 */
export const generateUserCharacterName = (userId: string, categoryId: string): string => {
  // 사용자 ID와 카테고리 ID를 조합하여 시드 생성
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) +
               categoryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return generateCharacterNameWithSeed(seed);
};
