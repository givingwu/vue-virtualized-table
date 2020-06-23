import { isValidElement } from './isValidElement'
/**
 * isFunction
 * @param {Function|any} fn
 */
export const isFunction = (fn) => typeof fn === 'function'

/**
 * isObject
 * @param {any} obj
 */
export const isObject = (obj) => obj && typeof obj === 'object'

export const isArray = Array.isArray

/**
 * isValidArray
 * @param {Array|any} array
 */
export const isValidArray = (array) => isArray(array) && !!array.length

/**
 * isString
 * @param {string|any}} string
 */
export const isString = (string) => typeof string === 'string'

/**
 * isNumber
 * @param {number|any} number
 */
export const isNumber = (number) => typeof number === 'number'

/**
 * isValidValue
 * @param {any} value
 */
export const isValidValue = (value) =>
  value !== null && value !== undefined && value !== ''

export const noop = () => {}

export const toArray = (children) => {
  let ret = []

  children.forEach((child) => {
    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child))
    } else if (isValidElement(child) && child.props) {
      ret = ret.concat(toArray(child.props.children))
    } else {
      ret.push(child)
    }
  })

  return ret
}
