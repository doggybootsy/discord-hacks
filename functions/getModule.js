let webpackExports = window.webpackChunkdiscord_app.push([[Math.random()],{},(e) => e])

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

console.log("%c[getModule]", "font-weight: bold; color: purple;", "Returned 'getModule'!")

return getModule
