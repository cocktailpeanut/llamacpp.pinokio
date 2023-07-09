const os = require('os')
const platform = os.platform()
let cmd
if (platform === "win32") {
  cmd = "rmdir /s /q bin"
} else {
  cmd = "rm -rf bin"
}
module.exports = {
  "run": [{
    "method": "shell.run",
    "params": {
      "message": cmd
    }
  }]
}
