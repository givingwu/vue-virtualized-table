const camelizeRE = /-(\w)/g

const camelize = (str) => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

const parseStyleText = (cssText = '', camel) => {
  const res = {}
  const listDelimiter = /;(?![^(]*\))/g
  const propertyDelimiter = /:(.+)/

  cssText.split(listDelimiter).forEach(function(item) {
    if (item) {
      const tmp = item.split(propertyDelimiter)
      if (tmp.length > 1) {
        const k = camel ? camelize(tmp[0].trim()) : tmp[0].trim()
        res[k] = tmp[1].trim()
      }
    }
  })

  return res
}

export function warning(valid, message) {
  // Support uglify
  if (
    process.env.NODE_ENV !== 'production' &&
    !valid &&
    console !== undefined
  ) {
    // eslint-disable-next-line no-console
    console.error(`Warning: ${message}`)
  }
}

export const isPlainObject = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export function getStyle(ele, camel) {
  let data = {}

  if (ele.data) {
    data = ele.data
  } else if (ele.$vnode && ele.$vnode.data) {
    data = ele.$vnode.data
  }

  let style = data.style || data.staticStyle

  if (typeof style === 'string') {
    style = parseStyleText(style, camel)
  } else if (camel && style) {
    // 驼峰化
    const res = {}
    Object.keys(style).forEach((k) => (res[camelize(k)] = style[k]))

    return res
  }

  return style
}

export function mergeProps() {
  const args = [].slice.call(arguments, 0)
  const props = {}

  args.forEach((p = {}) => {
    for (const [k, v] of Object.entries(p)) {
      props[k] = props[k] || {}
      if (isPlainObject(v)) {
        Object.assign(props[k], v)
      } else {
        props[k] = v
      }
    }
  })

  return props
}

export function shallowEqual(objA, objB, compare, compareContext) {
  var ret = compare ? compare.call(compareContext, objA, objB) : void 0

  if (ret !== void 0) {
    return !!ret
  }

  if (objA === objB) {
    return true
  }

  if (typeof objA !== 'object' || !objA || typeof objB !== 'object' || !objB) {
    return false
  }

  var keysA = Object.keys(objA)
  var keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB)

  // Test for A's keys different from B.
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx]

    if (!bHasOwnProperty(key)) {
      return false
    }

    var valueA = objA[key]
    var valueB = objB[key]

    ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0

    if (ret === false || (ret === void 0 && valueA !== valueB)) {
      return false
    }
  }

  return true
}

export function debounce(func, wait, immediate) {
  let timeout
  function debounceFunc(...args) {
    const context = this

    // https://fb.me/react-event-pooling
    if (args[0] && args[0].persist) {
      args[0].persist()
    }

    const later = () => {
      timeout = null

      if (!immediate) {
        func.apply(context, args)
      }
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)

    timeout = setTimeout(later, wait)

    if (callNow) {
      func.apply(context, args)
    }
  }

  debounceFunc.cancel = function cancel() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounceFunc
}

/**
 * @template T
 * @param {T} obj - A generic parameter that need be copied
 * @return {T}
 */
export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item)
      return arr
    }, [])
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key])
      return newObj
    }, {})
  }
}

/**
 * 循环深复制对象
 * @param {Object} obj a target object
 * @param  {Array<{}>} args an array of source object
 * @example
 *  var a = { a: 'a', b: 'a'}
 *  var b = { a: 'b', b: 'b'}
 *  deepMerge({}, a, b) // {a: "b", b: "b"}
 *  deepMerge({}, b, a) // {a: "a", b: "a"}
 */
export function deepMerge(obj, ...args) {
  for (let i = 0, l = args.length; i < l; i++) {
    const o = args[i]
    const ks = Object.keys(o)

    for (let j = 0, k = ks.length; j < k; j++) {
      const k = ks[j]

      if (typeof k === 'object') {
        obj[k] = deepCopy(o[k])
      } else {
        obj[k] = o[k]
      }
    }
  }

  return obj
}

export function omit(obj, fields) {
  const shallowCopy = {
    ...obj
  }

  for (let i = 0; i < fields.length; i++) {
    const key = fields[i]
    delete shallowCopy[key]
  }

  return shallowCopy
}

export function isValidElement(element) {
  return (
    element &&
    typeof element === 'object' &&
    'componentOptions' in element &&
    'context' in element &&
    element.tag !== undefined
  ) // remove text node
}

export const initDefaultProps = (propTypes, defaultProps) => {
  Object.keys(defaultProps).forEach((k) => {
    if (propTypes[k]) {
      propTypes[k].def && (propTypes[k] = propTypes[k].def(defaultProps[k]))
    } else {
      throw new Error(`not have ${k} prop`)
    }
  })

  return propTypes
}

export const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.name || 'Component'
}

export const getOptionProps = (instance) => {
  if (instance.componentOptions) {
    const componentOptions = instance.componentOptions
    const { propsData = {}, Ctor = {} } = componentOptions
    const props = (Ctor.options || {}).props || {}
    const res = {}

    for (const [k, v] of Object.entries(props)) {
      const def = v.default

      if (def !== undefined) {
        res[k] =
          typeof def === 'function' && getType(v.type) !== 'Function'
            ? def.call(instance)
            : def
      }
    }

    return { ...res, ...propsData }
  }

  const { $options = {}, $props = {} } = instance

  return filterProps($props, $options.propsData)
}

export function noop() {}

export function remove(array, item) {
  const index = array.indexOf(item)
  const front = array.slice(0, index)
  const last = array.slice(index + 1, array.length)

  return front.concat(last)
}

export function stopPropagation(e) {
  e.stopPropagation()

  if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
    e.nativeEvent.stopImmediatePropagation()
  }
}

function getType(fn) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/)

  return match ? match[1] : ''
}

const filterProps = (props, propsData = {}) => {
  const res = {}

  Object.keys(props).forEach((k) => {
    if (k in propsData || props[k] !== undefined) {
      res[k] = props[k]
    }
  })

  return res
}
