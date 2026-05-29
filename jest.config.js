// Jest config — jest-expo preset (sdk-55).
// pnpm은 node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg> 구조라 transformIgnorePatterns가
// `node_modules/<pkg>` 직접 매칭만 하면 안 잡힘. .pnpm 경로 포함해서 트랜스폼 허용.
const esmModules = [
  '(jest-)?react-native',
  '@react-native(-community)?',
  'expo(nent)?',
  '@expo(nent)?/.*',
  '@expo-google-fonts/.*',
  'react-navigation',
  '@react-navigation/.*',
  '@unimodules/.*',
  'unimodules',
  'sentry-expo',
  'native-base',
  'react-native-svg',
  'nativewind',
  'react-native-css-interop',
  '@gorhom/.*',
  'lucide-react-native',
  'zustand',
].join('|');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/?(*.)+(test).(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    `node_modules/(?!(\\.pnpm/)?(${esmModules})|\\.pnpm/.*?/node_modules/(${esmModules}))`,
  ],
};
