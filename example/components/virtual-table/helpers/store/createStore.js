/* Forked from `ant-design` */

/**
 * createStore
 * @param {{}} initialState
 */
export default function createStore(initialState) {
  let state = initialState
  const listeners = []

  /**
   * setState
   * @param {{}} partial
   */
  function setState(partial) {
    state = { ...state, ...partial }

    for (let i = 0; i < listeners.length; i++) {
      listeners[i]()
    }
  }

  /**
   * getState
   * @returns {{}}
   */
  function getState() {
    return state
  }

  /**
   * subscribe
   * @param {(state: {}) => ()} listener
   * @returns {() => void}
   */
  function subscribe(listener) {
    listeners.push(listener)

    return function unsubscribe() {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  return {
    setState,
    getState,
    subscribe
  }
}
