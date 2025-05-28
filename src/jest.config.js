module.exports = {
  preset: 'react-app',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!tronweb|axios)/',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
