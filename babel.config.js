module.exports = {
  presets: [
    [
      "@vue/app",
      {
        useBuiltIns: "entry",
        modules: false,
      },
    ],
  ],
  plugins: ["@babel/plugin-proposal-optional-catch-binding"],
};
