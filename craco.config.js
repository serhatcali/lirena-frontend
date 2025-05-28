const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.resolve.fallback = {
        querystring: require.resolve('querystring-es3'),
        fs: false,  // fs modülünü tarayıcıda kullanamayacağımız için false yapıyoruz
      };
      return webpackConfig;
    },
  },
};

