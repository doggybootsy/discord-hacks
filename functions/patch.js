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

console.log("%c[patch]", "font-weight: bold; color: purple;", "Returned 'patch'!")

return patch
