<div align="center">
  <h1>Webpack Modern Build Plugin</h1>
  <p>Plugin that creates module/nomodule scripts.</p>
</div>

<h2 align="center">Install</h2>

```bash
  npm i --save-dev webpack-modern-build-plugin
```

```bash
  yarn add --dev webpack-modern-build-plugin
```

<h2 align="center">Usage</h2>

The plugin generates module/nomodule scripts and relies on [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin). This plugin expects to return two configurations in your webpack - legacy and modern.
One of those values should be passed as mode option to the plugin in both configurations.

Example of `webpack` config:

**webpack.config.js**

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackModernBuildPlugin = require("webpack-modern-build-plugin");

module.exports = {
  entry: "index.js",
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new WebpackModernBuildPlugin({
      mode: "modern",
    }),
  ],
  entry: "index.js",
  output: {
    path: __dirname + "/dist",
    filename: "es5.bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new WebpackModernBuildPlugin({
      mode: "legacy",
    }),
  ],
};
```

This will generate a file `dist/index.html` containing the following

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Webpack App</title>
  </head>
  <body>
    <script src="bundle.js" type="module" crossorigin="anonymous"></script>
    <script>
      (function () {
        var d = document;
        var c = d.createElement("script");
        if (!("noModule" in c) && "onbeforeload" in c) {
          var s = !1;
          d.addEventListener(
            "beforeload",
            function (e) {
              if (e.target === c) {
                s = !0;
              } else if (!e.target.hasAttribute("nomodule") || !s) {
                return;
              }
              e.preventDefault();
            },
            !0
          );
          c.type = "module";
          c.src = ".";
          d.head.appendChild(c);
          c.remove();
        }
      })();
    </script>
    <script src="es5.bundle.js" nomodule></script>
  </body>
</html>
```

The script in the middle between type="module" and nomodule is for Safari 10.1. This version supports modules, but does not support the `nomodule` attribute - it will load "script nomodule" anyway. This snippet solve this problem, but only for script tags that load external code.
