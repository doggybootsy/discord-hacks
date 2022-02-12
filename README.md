**Note:** I am not apart of Discord



# Console Hacks
<details>
  <summary>Hacks</summary>
  
  ### Table of Contents  
  [get module filter function](#get-module-filter-function)  
  [Patcher](#Patcher)  
  [send local embeds](#send-local-embeds)  
  [silent typing](#silent-typing)  
  [enable developer mode](#enable-developer-mode)  
  [enable discords message reporting system](#enable-discords-message-reporting-system)  
  [collapsible sidebar](#collapsible-sidebar)  
  [login via token](#login-via-token)  
  [get your token](#get-your-token)  
  [get all badges](#get-all-badges)  
  [get all private channel ids](#get-all-private-channel-ids)  
  [phone email verification bypass](#phone-email-verification-bypass)  
  [toggle nsfw allowed](#toggle-nsfw-allowed)  
  [free discord nitro](#free-discord-nitro)  
  
### Get Module Filter Function
<details>
  <summary>Details and Code</summary>
  
Filters through all of discords exported webpack modules

If you have the [app injection](https://github.com/doggybootsy/discord-hacks/blob/main/README.md#app-injection) you dont need to add this, if you dont you only need to paste this code in console once per load (If you reload you need to add it again)

```js
let webpackExports = !webpackChunkdiscord_app.webpackExports ? webpackChunkdiscord_app.push([[Math.random()],{},(exports) => {
  webpackChunkdiscord_app.pop()
  webpackChunkdiscord_app.webpackExports = exports
  return exports
}]) : webpackChunkdiscord_app.webpackExports

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

If you have the [app injection](https://github.com/doggybootsy/discord-hacks/blob/main/README.md#app-injection) you dont need to add this, if you dont you only need to paste this code in console once per load (If you reload you need to add it again)

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
  
  Object.assign(module[funcName], original)
  module[funcName].toString = () => original.toString

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

### Send Local Embeds
<details>
  <summary>Details and Code</summary>
  
Send a fake message with a embed and a message in the current channel (Do not the alert means nothing)

Requirements: `Get Module Filter Function`
  
```js
let { getChannelId } = getModule(["getChannelId", "getVoiceChannelId"])
let { receiveMessage } = getModule(["receiveMessage"])
let { createBotMessage } = getModule(["createBotMessage"])
let { getCurrentUser } = getModule(["getCurrentUser"])

function sendFakeEmbed(message, embed) {
  let msg = createBotMessage(getChannelId(), message, [embed])
  msg.author = getCurrentUser()
  msg.mention_everyone = false
  msg.type = 0
  msg.flags = 16
  receiveMessage(msg.channel_id, msg)
}
```
Example: `sendFakeEmbed("Message Content")` and `sendFakeEmbed("Message Content", { title: "Message Embed Title" })`
</details>
  
### Silent Typing
<details>
  <summary>Details and Code</summary>
  
Make everyone can't see you're typing

Requirements: `Get Module Filter Function and Patcher Function`
  
```js
Patcher.instead(getModule(["startTyping"]), "startTyping", () => () => {})
```
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


### Collapsible Sidebar
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function` and `Patcher`
  
Adds a button to the toolbar that will collapse the sidebar
  
```js
let module = getModule("HeaderBarContainer").default.prototype
let React = getModule(["createElement"])
let classes = {
  ...getModule(["panels"]),
  ...getModule(["title", "container", "themed"]), 
  ...getModule(["iconWrapper", "clickable"]), 
  ...getModule(["container", "subscribeTooltipHeader"])
}
let tooltip = getModule(["TooltipContainer"]).TooltipContainer
let { sidebar } = getModule(["guilds", "container", "sidebar"])

let Icon = React.memo(() => {
  let [state, setState] = React.useState(document.querySelector(`.${sidebar}.compact`))
  return React.createElement(tooltip, {
    text: state ? "Show" : "Hide", 
    position: "bottom",
    className: `compact-arrow ${classes?.iconWrapper}${state ? " active" : ""}`,
    key: "compact-arrow",
    children: [
      React.createElement("svg", {
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "currentcolor",
        onClick: () => {
          setState(!state)
          document.querySelector(`.${sidebar}`).classList.toggle("compact")
        },
        children: [
          React.createElement("path", {
            d: "M15.535 3.515L7.05005 12L15.535 20.485L16.95 19.071L9.87805 12L16.95 4.929L15.535 3.515Z"
          })
        ]
      })
    ]
  })
})

document.head.appendChild(Object.assign(document.createElement("style"), {
  innerHTML: [
    ".compact-arrow { transition: transform 0.2s ease-in-out; color: var(--interactive-normal) }", 
    ".compact-arrow.active { transform: rotate(180deg)  }",
    ".compact-arrow:hover { color: var(--interactive-active)  }",
    `.${sidebar} { transition: width 0.2s ease-in-out }`,
    `.${sidebar}.compact { width: 0 }`,
    `.${classes.container}, .${classes.panels} { width: 240px }`,
  ].join("\n")
}))

patch(module, "renderLoggedIn", (_, res) => {
  res.props.children.unshift(React.createElement(Icon))
})

document.querySelector(`.${classes.themed}`).__reactFiber$.return.return.stateNode.forceUpdate()
```
</details>

### Login Via Token
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Allows you to sign into a discord account via token (DO NOT USE A BOT ACCOUNT)
  
```js
getModule(["setToken"]).setToken("Token_HERE")
```
</details>

### Get Your Token
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Shows you your token (DO NOT SHARE THIS TO ANYONE)
  
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

### Get All Private Channel IDs
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Shows you all private channel ids
  
```js
getModule(["getPrivateChannelIds"]).getPrivateChannelIds()
```
</details>

### Phone, Email verification bypass
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Bypass Phone and email verification in server, this cannot let you send message but you still can connect and and talk in voice channels [credits](https://github.com/hxr404/Discord-Console-hacks#phone-email-verification-bypass)
  
```js
let user = getModule(["getCurrentUser"]).getCurrentUser()
user.phone = "+1234567890"
user.email = "email@email.com"
user.verified = true
```
</details>

### Toggle NSFW Allowed
<details>
  <summary>Details and Code</summary>

Requirements: `Get Module Filter Function`
  
Toggles the ability to see inside NSFW channels
  
```js
getModule(["getCurrentUser"]).getCurrentUser().nsfwAllowed = true
```

Change `true` to `false` to disable
</details>

### Free Discord Nitro
<details>
  <summary>Details and Code</summary>

## WARNING YOU CAN GET BANNED FOR DOING THIS!
(Only For Screensharing !!!)

Requirements: `Get Module Filter Function` and `Patcher`
  
Allows you to have free nitro (Emotes and Screenshare)
  
```js
let sendMessage = getModule(["sendMessage"])
let { getCurrentUser } = getModule(["getCurrentUser"])
let EmojiSize = 64

getCurrentUser().premiumType = 2
patch.before(sendMessage, "sendMessage", (_, msg) => {
  for (const emoji of msg.validNonShortcutEmojis) {
    if (emoji.url.startsWith("/assets/")) return
    msg.content = msg.content.replace(`<${emoji.animated ? "a" : ""}${emoji.allNamesString.replace(/~\d/g, "")}${emoji.id}>`, `${emoji.url}&size=${EmojiSize} `)
  }
})
patch.before(sendMessage, "editMessage", (_, __, obj) => {
  let msg = obj.content
  if (msg.search(/\d{18}/g) == -1) return
  for (const emoji of msg.match(/<a:.+?:\d{18}>|<:.+?:\d{18}>/g)) 
    obj.content = obj.content.replace(emoji, `https://cdn.discordapp.com/emojis/${emoji.match(/\d{18}/g)[0]}?size=40`)
})
```
</details>
</details>

# App injection
<details>
  <summary>injection</summary>
Removing for now
</details>
