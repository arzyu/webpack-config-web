import { resolve } from "path";

import { Configuration } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import EslintWebpackPlugin from "eslint-webpack-plugin";

import { resolveTsAliases } from "resolve-ts-aliases";

const devMode = process.env.NODE_ENV !== "production";

const root = resolve(process.cwd());
const context = resolve(root, "src");
const dist = resolve(root, "dist");

const CSS_MODULES_LOCAL_IDENT_NAME = devMode ? "[local]--[hash:base64:7]" : "[hash:base64:7]";

const config: Configuration = {
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    alias: resolveTsAliases(resolve("tsconfig.json"))
  },
  context,
  entry: {
    index: "./index"
  },
  output: {
    filename: devMode ? "[name].js" : "[name].[contenthash:7].js",
    path: dist
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              cacheDirectory: true,
              presets: [
                "@babel/preset-env",
                "@babel/preset-typescript",
                "@babel/preset-react"
              ],
              plugins: [
                "@babel/plugin-transform-runtime",
                ["@dr.pogodin/babel-plugin-react-css-modules", {
                  context,
                  exclude: "node_modules",
                  webpackHotModuleReloading: true,
                  generateScopedName: CSS_MODULES_LOCAL_IDENT_NAME
                }]
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: CSS_MODULES_LOCAL_IDENT_NAME
              }
            }
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  ["postcss-preset-env", {
                    stage: 3,
                    features: {
                      "nesting-rules": true
                    }
                  }]
                ]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "index.ejs"
    }),
    new EslintWebpackPlugin({
      extensions: ["ts", "tsx"],
      baseConfig: {
        extends: [
          "@arzyu/react"
        ]
      }
    })
  ],
  devServer: {
    contentBase: dist,
    host: "0.0.0.0",
    hot: true
  }
};

export default config;
