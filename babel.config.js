const path = require('path');

module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        // 절대 경로 사용: 릴리즈 빌드 시 Metro 워커의 process.cwd()가 프로젝트 루트가 아닐 수 있어
        // 상대 경로 '.env'는 찾지 못함. babel.config.js 위치(__dirname) 기준으로 고정.
        path: path.resolve(__dirname, '.env'),
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
