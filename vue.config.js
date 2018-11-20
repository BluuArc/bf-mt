module.exports = {
  baseUrl: './',
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: process.env.NODE_ENV === 'production',
    },
  },
  outputDir: 'dist/bf-mt',
};
