const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const path = require("path")
const basePath = "./src/client/js/";

module.exports = {
  mode: "development",
  entry: {
    main: basePath + "main.js",
    videoPlayer: basePath + "videoPlayer.js",
    recoder: basePath + "recoder.js",
    commentMain: basePath + "commentMain.js",
  },
  plugins: [new MiniCssExtractPlugin({
    filename: "css/styles.css",
  }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },
      {
        test: /\.scss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
}
