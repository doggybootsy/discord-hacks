**Note:** I am not apart of Discord

# Console Hacks
<details>
  <summary>Hacks</summary>

### Get Module Filter Function
<details>
  <summary>Details and Code</summary>
  
Filters through all of discords exported webpack modules

If you have the client injection you dont need to add this, if you dont you only need to paste this code in console once per load (If you reload you need to add it again)

If you have any client mods like Betterdiscord do this (You can also make a simple plugin with this)
```js
let getModuleFetch = await fetch(`https://raw.githubusercontent.com/doggybootsy/discord-hacks/main/functions/getModule.js.js?_${Date.now()}`).then(e => e.text())
toWindow("getModule", window.eval(`(() => {\n${getModuleFetch}\n})()`))
```
If you dont do this
```js
let webpackExports = webpackChunkdiscord_app.push([[Math.random()],{},(e) => e])

function getModule(filter, first = true) {
  let modules = []
  function byPropsAll(...props) {
    const norm = getModule(m => props.every((prop) => typeof m[prop] !== "undefined"), false)
    let def = []
    for (const module of getModule(m => props.every((prop) => typeof m.default?.[prop] !== "undefined"), false)) 
      def.push(module.default)
    return [...norm, ...def]
  }
  function byDisplayName(displayName) {
    const norm = getModule(m => m.default?.displayName === displayName, false)
    const type = getModule(m => m.default?.type?.displayName === displayName, false)
    const rend = getModule(m => m.default?.type?.render?.displayName === displayName, false)
    return [...norm, ...type, ...rend]
  }
  if (Array.isArray(filter)) {
    modules = byPropsAll(...filter)
  }
  else if (typeof filter === "string") {
    modules = byDisplayName(filter)
  }
  else if (typeof filter === "function") {
      for(let ite in webpackExports.c) {
      if(!Object.hasOwnProperty.call(webpackExports.c, ite)) return
      let ele = webpackExports.c[ite].exports
      if(!ele) continue
      if(filter(ele)) modules.push(ele)
    }
  }
  if (first) return modules[0]
  return modules
}
```
Example: `getModule("PanelButton")`, `getModule(["createElement"])`, `getModule(["Messages"], false)[1]`, and `DrApi.find(e => e.default?.definition?.label === "Desktop Multi Account")`
</details>

### Patcher
<details>
  <summary>Details and Code</summary>
  
Patches a module with a function

If you have the client injection you dont need to add this, if you dont you only need to paste this code in console once per load (If you reload you need to add it again)

If you have any client mods like Betterdiscord do this (You can also make a simple plugin with this)
```js
let patchFetch = await fetch(`https://raw.githubusercontent.com/doggybootsy/discord-hacks/main/functions/patch.js?_${Date.now()}`).then(e => e.text())
toWindow("patch", window.eval(`(() => {\n${patchFetch}\n})()`))
```
If you dont do this
```js
function patch(module, funcName, callback, type = "after") {
  const original = module[funcName]
  if (!module[funcName].__originalFunction) module[funcName].__originalFunction = original
  if (!module[funcName].__patches) module[funcName].__patches = []

  if (type === "after") module[funcName] = function() {
    const result = original.apply(this, arguments)
    callback.apply(this, [[...arguments], result])
    return result
  }
  else if (type === "before") module[funcName] = function() {
    callback.apply(this, [...arguments])
    return original.apply(this, arguments)
  }
  else if (type === "instead") module[funcName] = function() {
    return callback.apply(this, [[...arguments], original])
  }
  else throw new Error(`Unknown patch type: ${type}`)

  if (Object.keys(original).length) 
    for (const key of Object.keys(original)) 
      module[funcName][key] = original[key]

  const position = module[funcName].__patches.push([module, funcName, callback, type]) - 1
  // Unpatch all patches on 'module[funcName]', then re-patch them unless they are the one getting unpatched
  return () => {
    module[funcName] = module[funcName].__originalFunction
    module[funcName].__patches.splice(position, 1)
    const oldPatches = module[funcName].__patches
    module[funcName].__patches = []
    for (const _patch of oldPatches) setImmediate(patch, ..._patch)
  }
}

Object.assign(patch, {
  before: (module, funcName, callback) => patch(module, funcName, callback, "before"),
  after: (module, funcName, callback) => patch(module, funcName, callback, "after"),
  instead: (module, funcName, callback) => patch(module, funcName, callback, "instead")
})
```
</details>

### Send Embeds
<details>
  <summary>Details and Code</summary>

## WARNING YOU CAN GET BANNED FOR DOING THIS!
  
Send a embed (with a message) in the current channel

Requirements: `Get Module Filter Function`
  
```js
let queue = getModule(["enqueue"])
let { getChannelId } = getModule(["getChannelId", "getVoiceChannelId"])
let { createBotMessage } = getModule(["createBotMessage"])

function sendEmbed(content, embed = {}) {
  let channelId = getChannelId()
  const { id:nonce } = createBotMessage(channelId, "")
  queue.enqueue({
    type:0, nonce, 
    message: {
      channelId, content, embed
    }
  }, (_ => _))
}
```
Example: `sendEmbed("Message Content")` and `sendEmbed("Message Content", { title: "Message Embed Title" })`
</details>

### Enable Developer Mode
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Enabled discords developer mode (Look at settings)

```js
Object.defineProperty(getModule(["isDeveloper"]), "isDeveloper", {
  get: () => true,
  set () {}
})
```
</details>

### Enable Discords Message Reporting System
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function` and `Patcher`
  
Allows you to report messages to the discord message reporting system
  
```js
patch(getModule("MiniPopover"),  "default", ([props]) => {
  const child = props.children.filter(e => e?.props)
  if (child.length) child[0].props.canReport = true
})
```
</details>

### Get Your Token
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Shows you your token
  
```js
getModule(["getToken"]).getToken()
```
</details>

### Get all badges
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Gives you all badges (Locally)
  
```js
Object.defineProperty(getModule(["getCurrentUser"]).getCurrentUser(), "flags", {
  get: () => 219087
})
```
</details>

### Toggle NSFW channels
<details>
  <summary>Details and Code</summary>∂

Requirements: `Get Module Filter Function`
  
Toggles the ability to see inside NSFW channels
  
```js
let currentUser = getModule(["getCurrentUser"]).getCurrentUser()
currentUser.nsfwAllowed = !currentUser.nsfwAllowed
```
</details>

### Free Discord Nitro
<details>
  <summary>Details and Code</summary>

## WARNING YOU CAN GET BANNED FOR DOING THIS!

Requirements: `Get Module Filter Function` and `Patcher`
  
Allows you to have free nitro (You dont get everything tho)
  
```js
let sendMessage = getModule(["sendMessage"])
let { getCurrentUser } = getModule(["getCurrentUser"])

getCurrentUser().premiumType = 2
patch.before(sendMessage, "sendMessage", (_, msg) => {
  for (const emoji of msg.validNonShortcutEmojis) {
    if (emoji.url.startsWith("/assets/")) return;
    msg.content = msg.content.replace(`<${emoji.animated ? "a" : ""}${emoji.allNamesString.replace(/~\d/g, "")}${emoji.id}>`, `${emoji.url}&size=64 `)
  }
})
patch.before(sendMessage, "editMessage", (_, __, obj) => {
  let msg = obj.content
  if (msg.search(/\d{18}/g) == -1) return;
  for (const emoji of msg.match(/<a:.+?:\d{18}>|<:.+?:\d{18}>/g)) {
    obj.content = obj.content.replace(emoji, `https://cdn.discordapp.com/emojis/${emoji.match(/\d{18}/g)[0]}?size=40`)
  }
})
```
</details>
</details>

# App injection
<details>
  <summary>injection</summary>

### What does this do?
1. Disables `CSP`
2. Adds `require` to the `window` object
3. Adds a debbuger hotkey
4. Removes discords annoying console spam when opening console
5. Automatically adds `Get Module Filter Function` and `Patcher`
### What can I do with this?
1. Make themes/plugins/etc
2. Make console injections permanent (Until you remove it)
### Steps
1. Go to your discords resources folder and make a folder called `app`
2. Make a `index.js` file in the `app` folder and paste the code below into it
```js
const { join } = require("path")
const electron = require("electron")
const Module = require("module")

electron.app.commandLine.appendSwitch("no-force-async-hooks-checks")

class BrowserWindow extends electron.BrowserWindow {
  constructor(opt) {
    if (!opt || !opt.webPreferences || !opt.webPreferences.preload || !opt.title) return super(opt)
    const originalPreload = opt.webPreferences.preload
    process.env.DISCORD_PRELOAD = originalPreload
    
    opt = Object.assign(opt, {
      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: true,
        nodeIntegration: true,
        preload: join(__dirname, "preload.js")
      }
    })
    super(opt)
  }
}

electron.app.once("ready", () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(function({ responseHeaders }, callback) {
    delete responseHeaders["content-security-policy-report-only"]
    delete responseHeaders["content-security-policy"]
    callback({ 
      cancel: false, 
      responseHeaders
    })
  })
})

const Electron = new Proxy(electron, { get: (target, prop) => prop === "BrowserWindow" ? BrowserWindow : target[prop] })

const electronPath = require.resolve("electron")
delete require.cache[electronPath].exports
require.cache[electronPath].exports = Electron

const basePath = join(process.resourcesPath, "app.asar")
const pkg = require(join(basePath, "package.json"))
electron.app.setAppPath(basePath)
electron.app.name = pkg.name
Module._load(join(basePath, pkg.main), null, true)
```
3. Make a `preload.js` file in the `app` folder and paste the code below into it
```js
const { webFrame } = require("electron")

// Load discords preload
const path = process.env.DISCORD_PRELOAD
if (path) { require(path) }
else { console.error("No preload path found!") }

((window) => {
  const toWindow = (key, value) => {
    if (key.name === undefined){
      window[key] = value
      global[key] = value
    }
    else {
      window[key.name] = key
      global[key.name] = key
    }
  }
  window.document.addEventListener("DOMContentLoaded", async () => {
    toWindow(require)
    // Add debugger event
    window.addEventListener("keydown", () => event.code === "F8" && (() => {debugger;})())
    // Remove discords warnings
    DiscordNative.window.setDevtoolsCallbacks(null, null)
    // Add `getModule`
    let getModuleFetch = await fetch(`https://raw.githubusercontent.com/doggybootsy/discord-hacks/main/functions/getModule.js.js?_${Date.now()}`).then(e => e.text())
    toWindow("getModule", window.eval(`(() => {\n${getModuleFetch}\n})()`))
    // Add `patch`
    let patchFetch = await fetch(`https://raw.githubusercontent.com/doggybootsy/discord-hacks/main/functions/patch.js?_${Date.now()}`).then(e => e.text())
    toWindow("patch", window.eval(`(() => {\n${patchFetch}\n})()`))
  })
})(webFrame.top.context)
```
4. Make a `package.json` file in the `app` folder and paste `{"name": "discord", "main": "./index.js"}` into it
5. Fully restart discord
</details>
