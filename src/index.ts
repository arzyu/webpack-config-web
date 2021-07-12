import { resolve } from "path";

import { resolveTsAliases } from "resolve-ts-aliases";
import { Configuration, WebpackPluginInstance } from "webpack";
import HtmlPlugin from "html-webpack-plugin";
import EslintPlugin from "eslint-webpack-plugin";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";

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
  mode: devMode ? "development" : "production",
  output: {
    filename: "[name].[contenthash:7].js",
    path: dist,
    clean: true
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
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
                }],
                devMode && "react-refresh/babel"
              ].filter(Boolean)
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
      },
      {
        test: /\.(ttf|png|apng|svg)$/,
        type: "asset/inline"
      }
    ]
  },
  plugins: [
    new HtmlPlugin({
      template: "index.ejs"
    }),
    new EslintPlugin({
      extensions: ["ts", "tsx"],
      baseConfig: {
        extends: [
          "@arzyu/react"
        ]
      }
    }),
    devMode && new ReactRefreshPlugin(),
  ].filter(Boolean) as WebpackPluginInstance[],
  devServer: {
    contentBase: dist,
    host: "0.0.0.0",
    useLocalIp: true,
    hot: true
  }
};

if (devMode) {
  config.devtool = "eval-cheap-module-source-map";
}

export default config;
