const path = require('path')
const fs = require('fs')
const os = require('os')
class Rpc {
  async run (req, ondata, kernel) {
    let params = req.params
    let i = 1;

    let platform = os.platform()
    if (!params.message._) {
      params.message._ = [(platform === "win32" ? "main" : "./main")]
    }

    if (!params.path) {
      if (platform === "win32") {
        //params.path = path.resolve(req.dirname, "bin", "llamacpp", "build", "bin", "Release")
        params.path = path.resolve(req.dirname, "bin", "llamacpp", "build", "bin")
      } else {
        params.path = path.resolve(req.dirname, "bin", "llamacpp", "build", "bin")
      }
    }

    if (!params.message.m.startsWith("/")) {
      params.message.m = path.resolve(req.dirname, "models", ...params.message.m.split("/"))
    }

    let mode
    if (params.message.clean) {
      mode = "clean" 
      delete params.message.clean
    }
    while(true) {
      let res = await this._run(params, i, mode, kernel, ondata)
      if (res && res.length > 0) {
        return res
      } else {
        i++;
      }
    }
  }
  async _run (params, i, mode, kernel, ondata) {
    let started = false
    let ended = false
    let buf = ""
    let response_start_counter = 0
    if (typeof params.message === "object") {
      if (params.message.p) {
        params.message.p = this.escapeCmd(params.message.p)
      }
    }
    let sh = kernel.sh()
    await sh.request({
      path: params.path,
      message: params.message,
    }, (stream) => {
      if (mode === "clean") {
        if (started) {
          ondata(stream)
        }
      } else {
        ondata(stream)
      }
      if (!started) {
        let test = /### Response.*### Response/gs.test(stream.cleaned.replaceAll(/[\r\n]/g, ""))
        if (test) {
          started = true
        }
      } else {
        let str1 = stream.cleaned
        let str2 = stream.cleaned
        let str3 = stream.cleaned
        let test1 = /### Response.*### Response(.+)###/gs.exec(str1)
        let test2 = /### Response.*### Response(.+?)llama_print_timings:/gs.exec(str2)
        let test3 = /### Response.*### Response(.+?)\[end of text\]/gs.exec(str3)
        if (test1) {
          ended = true
          buf = test1[1].trim()
          sh.kill()
        } else if (test3) {
          buf = test3[1].trim()
          sh.kill()
        } else if (test2) {
          ended = true
          buf = test2[1].trim()
          sh.kill()
        }
      }
    })
    buf = buf     // replace everything before and including the delimiter
//    .replace(/##.+/gs, "")                  // remove edge cases where it returns additional ### tags
//    .replace(/\[end of text\]/, "")       // remove the end of text marker
//    .replaceAll(/llama_.+:/g, "")
//    .replaceAll(/<[^>]+>/g, "")
    .trim()
    return buf
  }
  escapeCmd (str) {
    let s = str
    // Characters that need to be escaped
    //const specialChars = ['"', "'", '\\', '`', '!', '$', '&', '(', ')', '*', ';', '<', '>', '?', '[', ']', '{', '}'];
    const specialChars = ['"', "'"];

    // Escape each special character with a backslash
    for (const char of specialChars) {
      s = s.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
    }

    return s;
  }
}
module.exports = Rpc
