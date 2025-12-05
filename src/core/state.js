/**
 * @fileoverview Simple reactive store with observer pattern.
 */

/**
 * Creates a reactive store.
 * @template T
 * @param {T} initialState - Initial state object
 * @returns {Object} Store instance
 */
export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function getState() {
    return { ...state };
  }

  function setState(updater) {
    const result = typeof updater === 'function' ? updater(state) : updater;
    if (result !== undefined) {
      state = { ...state, ...result };
    }
    listeners.forEach((fn) => {
      try {
        fn(getState());
      } catch (e) {
        console.error('Listener error:', e);
      }
    });
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    getState,
    setState,
    subscribe,
    get state() {
      return state;
    },
  };
}
