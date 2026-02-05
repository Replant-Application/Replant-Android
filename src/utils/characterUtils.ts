/**
 * 캐릭터 관련 유틸리티 함수
 */

/**
 * 레벨별 캐릭터 정적 이미지 (PNG) - 프로필/리스트용, GIF 대신 사용하여 렉 방지
 */
export const getCharacterImageStatic = (level: number) => {
  const levelFolder = `level${Math.min(level, 6)}`;
  switch (levelFolder) {
    case 'level1':
      return require('../assets/images/characters/level1/default_static.png');
    case 'level2':
      return require('../assets/images/characters/level2/default_static.png');
    case 'level3':
      return require('../assets/images/characters/level3/default_static.png');
    case 'level4':
      return require('../assets/images/characters/level4/default_static.png');
    case 'level5':
      return require('../assets/images/characters/level5/default_static.png');
    case 'level6':
      return require('../assets/images/characters/level6/default_static.png');
    default:
      return require('../assets/images/characters/level1/default_static.png');
  }
};

// 레벨별 캐릭터 이미지 가져오기 (GIF, 애니메이션)
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

