<details>
  <summary>Get Module Filter Function</summary>
<br/>
  
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
<details>
  <summary>Patcher</summary>
<br/>
  
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
<details>
  <summary>Send Embeds</summary>
<br/>

## WARNING YOU CAN GET BANNED FOR DOING THIS!
  
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
<details>
  <summary>Enable Developer Mode</summary>
<br/>

Requirements: `Get Module Filter Function`
  
```js
Object.defineProperty(getModule(["isDeveloper"]), "isDeveloper", {
  get: () => true,
  set () {}
})
```
</details>
<details>
  <summary>Enable Discords Message Reporting System</summary>
<br/>

Requirements: `Get Module Filter Function` and `Patcher`
  
```js
patch(getModule("MiniPopover"),  "default", ([props]) => {
  const child = props.children.filter(e => e?.props)
  if (child.length) child[0].props.canReport = true
})
```
</details>
