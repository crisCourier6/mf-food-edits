const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const { dependencies } = require("./package.json");
const dotenv = require("dotenv")
const webpack = require("webpack")
dotenv.config()

module.exports = {
  entry: "./src/entry",
  mode: "development",
  devServer: {
    port: process.env.REACT_APP_PORT, // Modificar
    host: process.env.REACT_APP_HOST,
    allowedHosts: 'all',
    historyApiFallback: true, // Necesario para que funcione React Router
    client: {
            overlay: false
          }
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.REACT_APP_GATEWAY_URL": JSON.stringify(process.env.REACT_APP_GATEWAY_URL),
      "process.env.REACT_APP_IMAGES_URL" : JSON.stringify(process.env.REACT_APP_IMAGES_URL)
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new ModuleFederationPlugin({
      name: "mf_food_edits", // Modificar
      filename: "remoteEntry.js",
      exposes: {
        "./FoodEdit": "./src/components/FoodEdit",
        "./FoodEditList": "./src/components/FoodEditList",
        "./FoodEditUserList": "./src/components/FoodEditUserList",
        "./FoodEditPendingCount": "./src/components/FoodEditPendingCount",
        "./FoodEditHistory": "./src/components/FoodEditHistory",
      },
      shared: {
        ...dependencies,
        react: {
          singleton: true,
          requiredVersion: dependencies["react"],
        },
        "react-dom": {
          singleton: true,
          requiredVersion: dependencies["react-dom"],
        },
        'react-router-dom': {
            singleton: true,
          },
      },
    }),
  ],
  output: {
    publicPath: process.env.REACT_APP_PUBLIC_PATH || '/', // Necesario para rutas anidadas (/path/nested-path)
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  target: "web",
};

// Solo modificar las lineas que tienen comentarios