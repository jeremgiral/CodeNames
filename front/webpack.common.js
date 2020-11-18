const path = require("path")
const fs = require("fs")
const lessToJs = require("less-vars-to-js")

const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, "./scripts/ant-theme-vars.less"), "utf8"))

module.exports = {
  // Tell webpack the root file of our react application
  context: __dirname,
  name: "client",
  target: "web",
  entry: "./src/client/client.js",

  // Tell webpack where to put the output file
  // that is generated
  output: {
    filename: "js/bundle.js",
    path: path.resolve(__dirname, "public"),
    publicPath: "/public/"
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  module: {
    rules: [
      {
        // Add .jsx here to use jsx files
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["env", { targets: { browsers: ["last 2 versions"] } }], "react", "stage-0"],
              plugins: ["react-hot-loader/babel", ["import", { libraryName: "antd", style: true }], "transform-strict-mode", "transform-object-rest-spread", "transform-class-properties"]
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          {
            loader: "less-loader",
            options: {
              modifyVars: themeVariables,
              root: path.resolve(__dirname, "./"),
              javascriptEnabled: true
            }
          }
        ]
      }
    ]
  }
}
