let mix = require("laravel-mix")

mix.setPublicPath("./")
mix
  .ts("src/index.tsx", "dist")
  .options({
    legacyNodePolyfills: true
  })
  .webpackConfig({
    resolve: {
      fallback: {
        /*url: require.resolve("url"),
        fs: require.resolve("fs"),
        assert: require.resolve("assert"),
        crypto: require.resolve("crypto-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        buffer: require.resolve("buffer"),
        stream: require.resolve("stream-browserify"),
        path: require.resolve("path-browserify")*/
        crypto: false,
        os: false,
        path: false,
        stream: false,
        fs: false
      }
    }
  })
  .react()
