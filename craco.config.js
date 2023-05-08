const path = require("path")

module.exports = {
  webpack: {
    // 配置路径别名
    alias: {
      "@": path.join(__dirname, "src"),
    },
  },
}
