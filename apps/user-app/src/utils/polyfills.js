// Minimal polyfills - chỉ những gì cần thiết cho simple-peer
// Total size: ~2-3KB instead of 500KB+

// Global process object (minimal)
if (typeof process === 'undefined') {
  window.process = {
    env: {},
    nextTick: queueMicrotask,
    version: 'v16.0.0',
    versions: { node: '16.0.0' },
    platform: 'browser',
    browser: true
  };
}

// Global reference
if (typeof global === 'undefined') {
  window.global = globalThis;
}

// Minimal Buffer polyfill (chỉ cho simple-peer)
if (typeof Buffer === 'undefined') {
  window.Buffer = {
    isBuffer: (obj) => obj && obj._isBuffer === true,
    from: (data, encoding) => {
      if (typeof data === 'string') {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(data);
        uint8Array._isBuffer = true;
        return uint8Array;
      }
      if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        const uint8Array = new Uint8Array(data);
        uint8Array._isBuffer = true;
        return uint8Array;
      }
      return new Uint8Array(0);
    },
    alloc: (size, fill = 0) => {
      const buffer = new Uint8Array(size);
      buffer.fill(fill);
      buffer._isBuffer = true;
      return buffer;
    },
    concat: (list) => {
      const totalLength = list.reduce((acc, buf) => acc + buf.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of list) {
        result.set(buf, offset);
        offset += buf.length;
      }
      result._isBuffer = true;
      return result;
    }
  };
}

// Minimal EventEmitter cho simple-peer
class MinimalEventEmitter {
  constructor() {
    this._events = {};
    this._maxListeners = 13;
  }
  
  on(event, listener) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(listener);
    return this;
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.removeListener(event, onceWrapper);
      listener.apply(this, args);
    };
    return this.on(event, onceWrapper);
  }
  
  emit(event, ...args) {
    const listeners = this._events[event];
    if (listeners) {
      // Clone array to avoid issues if listeners are modified during iteration
      const listenersArray = [...listeners];
      for (const listener of listenersArray) {
        try {
          listener.apply(this, args);
        } catch (error) {
          console.error('EventEmitter error:', error);
        }
      }
      return listenersArray.length > 0;
    }
    return false;
  }
  
  removeListener(event, listener) {
    const listeners = this._events[event];
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        if (listeners.length === 0) {
          delete this._events[event];
        }
      }
    }
    return this;
  }
  
  removeAllListeners(event) {
    if (event !== undefined) {
      delete this._events[event];
    } else {
      this._events = {};
    }
    return this;
  }
  
  setMaxListeners(n) {
    this._maxListeners = n;
    return this;
  }
  
  listeners(event) {
    return this._events[event] ? [...this._events[event]] : [];
  }
  
  listenerCount(event) {
    return this._events[event] ? this._events[event].length : 0;
  }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventEmitter: MinimalEventEmitter };
} else {
  window.EventEmitter = MinimalEventEmitter;
  // For simple-peer compatibility
  window.events = { EventEmitter: MinimalEventEmitter };
}

// Prevent readable-stream errors
const noop = () => {};
window.setImmediate = window.setImmediate || ((fn, ...args) => setTimeout(() => fn(...args), 0));
window.clearImmediate = window.clearImmediate || clearTimeout;

export default {};