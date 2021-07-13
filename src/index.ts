import { merge } from "webpack-merge";
import HtmlPlugin from "html-webpack-plugin";
import commonConfig from "@arzyu/webpack-config-common";

const config = merge(commonConfig, {
  plugins: [
    new HtmlPlugin({
      template: "index.ejs"
    })
  ]
});

export default config;
