const fs = require("fs-extra");

class AssetsManager {
  constructor(path) {
    this.path = path;
  }

  get() {
    return JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }

  set(data = {}) {
    fs.mkdirpSync(path.dirname(this.path));
    fs.writeFileSync(this.path, JSON.stringify(data));
  }

  remove() {
    fs.removeSync(this.path);
  }

  hasAssets() {
    return !!fs.existsSync(this.path);
  }
}

module.exports = AssetsManager;
