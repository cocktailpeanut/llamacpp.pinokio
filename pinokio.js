const fs = require('fs')
const path = require('path')
const exists = (filepath) => {
  return new Promise(r=>fs.access(filepath, fs.constants.F_OK, e => r(!e)))
}
module.exports = {
  title: "llamacpp",
  description: "Port of Facebook's LLaMA model in C/C++",
  icon: "icon.png",
  menu: async (kernel) => {
    let installed = await exists(path.resolve(__dirname, "bin", "llamacpp"))
    if (installed) {
      return [{
        html: "Installed",
        type: "label",
      }, {
        html: "<i class='fa-solid fa-plug'></i> Reinstall",
        type: "link",
        href: "install/bin/install.json"
      }]
    } else {
      return [{
        html: "<i class='fa-solid fa-plug'></i> Install",
        type: "link",
        href: "install/bin/install.json"
      }]
    }
  }
}
