module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated の最適化（常に配列の末尾に置く）
      'react-native-reanimated/plugin',
    ],
  };
};
