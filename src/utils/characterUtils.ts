/**
 * 캐릭터 관련 유틸리티 함수
 */

// 레벨별 캐릭터 이미지 가져오기
export const getCharacterImage = (level: number, emotion: string = 'default') => {
  const levelFolder = `level${Math.min(level, 6)}`;
  switch (levelFolder) {
    case 'level1':
      return emotion === 'happy' ? require('../assets/images/characters/level1/happy.gif') :
             require('../assets/images/characters/level1/default.gif');
    case 'level2':
      return emotion === 'happy' ? require('../assets/images/characters/level2/happy.gif') :
             require('../assets/images/characters/level2/default.gif');
    case 'level3':
      return emotion === 'happy' ? require('../assets/images/characters/level3/happy.gif') :
             require('../assets/images/characters/level3/default.gif');
    case 'level4':
      return emotion === 'happy' ? require('../assets/images/characters/level4/happy.gif') :
             require('../assets/images/characters/level4/default.gif');
    case 'level5':
      return emotion === 'happy' ? require('../assets/images/characters/level5/happy.gif') :
             require('../assets/images/characters/level5/default.gif');
    case 'level6':
      return emotion === 'happy' ? require('../assets/images/characters/level6/happy.gif') :
             require('../assets/images/characters/level6/default.gif');
    default:
      return require('../assets/images/characters/level1/default.gif');
  }
};

