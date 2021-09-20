const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const AssetsManager = require("./AssetsManager");

const pluginName = "webpack-modern-build-plugin";
const safariFixScript = `(function(){var d=document;var c=d.createElement('script');if(!('noModule' in c)&&'onbeforeload' in c){var s=!1;d.addEventListener('beforeload',function(e){if(e.target===c){s=!0}else if(!e.target.hasAttribute('nomodule')||!s){return}e.preventDefault()},!0);c.type='module';c.src='.';d.head.appendChild(c);c.remove()}}())`;

class ModernBuildPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    this.compiler = compiler;

    if (HtmlWebpackPlugin.getHooks) {
      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          {
            name: pluginName,
            stage: Infinity,
          },
          this.alterAssetTagGroups
        );

        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(
          pluginName,
          this.cleanHtml
        );
      });
    } else {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
        {
          name: pluginName,
          stage: Infinity,
        },
        this.alterAssetTagGroups
      );
      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(
        pluginName,
        this.cleanHtml
      );
    }
  }

  alterAssetTagGroups = ({ plugin, bodyTags, headTags, ...rest }, cb) => {
    if (!bodyTags) {
      bodyTags = rest.body;
    }
    if (!headTags) {
      headTags = rest.head;
    }

    const assetsManager = this.createAssetManager(plugin);

    const currentAssets =
      plugin.options.inject === "head" ? headTags : bodyTags;
    const scripts = currentAssets.filter((a) => a.tagName === "script" && a.attributes);

    this.setAttributesToScripts(scripts);

    if (assetsManager.hasAssets()) {
      this.injectAssets(assetsManager.get(), currentAssets);
      assetsManager.remove();
    } else {
      assetsManager.set(scripts);
    }

    cb();
  };

  cleanHtml = (data) => {
    data.html = data.html.replace(/\snomodule="">/g, " nomodule>");
  };

  createAssetManager = (plugin) => {
    const targetDir = this.compiler.options.output.path;
    const htmlName = path.basename(plugin.options.filename);
    const htmlPath = path.dirname(plugin.options.filename);

    const assetsPath = path.join(
      targetDir,
      htmlPath,
      `assets.${htmlName}.json`
    );

    return new AssetsManager(assetsPath);
  };

  setAttributesToScripts = (scripts) =>
    scripts.forEach((script) => {
      script.attributes = {
        ...script.attributes,
        ...(this.options.mode === "legacy"
          ? {
              nomodule: "",
            }
          : {
              type: "module",
              crossOrigin: "anonymous",
            }),
      };
    });

  injectAssets = (assets, target) => {
    const safariFixScriptTag = {
      tagName: "script",
      closeTag: true,
      innerHTML: safariFixScript,
    };

    if (this.options.mode === "legacy") {
      target.unshift(...assets, safariFixScriptTag);
    } else {
      target.push(safariFixScriptTag, ...assets);
    }
    target.sort((a) => (a.tagName === "script" ? 1 : -1));
  };
}

module.exports = ModernBuildPlugin;
