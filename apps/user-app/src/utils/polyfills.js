// Minimal polyfills - tailored for simple-peer with Node.js v22 compatibility
// Total size: ~2-3KB instead of 500KB+

// Global process object (updated for v22)
if (typeof process === 'undefined') {
  window.process = {
    env: {},
    nextTick: queueMicrotask,
    version: 'v22.0.0',
    versions: { node: '22.0.0' },
    platform: 'browser',
    browser: true,
  };
}

// Global reference
if (typeof global === 'undefined') {
  window.global = globalThis;
}

// Minimal Buffer polyfill (compatible with v22)
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
    },
    byteLength: (string, encoding) => new TextEncoder().encode(string).length,
    compare: (buf1, buf2) => {
      const u1 = new Uint8Array(buf1);
      const u2 = new Uint8Array(buf2);
      return u1.length === u2.length ? 0 : u1.length > u2.length ? 1 : -1;
    },
    slice: (buf, start, end) => new Uint8Array(buf).slice(start, end),
  };
}

// Minimal EventEmitter for simple-peer
class MinimalEventEmitter {
  constructor() {
    this._events = {};
    this._maxListeners = 10;
  }

  on(event, listener) {
    if (!this._events[event]) this._events[event] = [];
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
        if (listeners.length === 0) delete this._events[event];
      }
    }
    return this;
  }

  removeAllListeners(event) {
    if (event !== undefined) delete this._events[event];
    else this._events = {};
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

window.EventEmitter = MinimalEventEmitter;
window.events = { EventEmitter: MinimalEventEmitter };

// Minimal stream polyfill for readable-stream compatibility with v22
if (typeof window.stream === 'undefined') {
  window.stream = {
    Readable: class Readable {
      constructor(options) {
        this._readableState = {
          objectMode: options?.objectMode || false,
          ended: false,
          length: 0,
          buffer: [],
          reading: false,
        };
        this._read = options?.read || (() => {});
        this._destroyed = false;
        this._events = {};
      }

      push(chunk) {
        if (this._destroyed || this._readableState.ended) return false;
        if (chunk === null) {
          this._readableState.ended = true;
          this.emit('end');
          return false;
        }
        if (chunk) {
          this._readableState.buffer.push(chunk);
          this._readableState.length += chunk.length || 1;
          if (!this._readableState.reading) this.emitReadable();
        }
        return true;
      }

      read(size) {
        if (this._destroyed || this._readableState.ended) return null;
        this._readableState.reading = true;
        if (size === 0) return Buffer.alloc(0);
        if (!size) size = this._readableState.length;
        if (size > this._readableState.length) size = this._readableState.length;
        const chunk = this._readableState.buffer.shift();
        if (chunk) {
          this._readableState.length -= chunk.length || 1;
          this.emitReadable();
        }
        this._readableState.reading = false;
        return chunk || null;
      }

      emitReadable() {
        if (this._readableState.length > 0 && this._events['readable']) {
          this.emit('readable');
        }
      }

      destroy(err) {
        if (this._destroyed) return;
        this._destroyed = true;
        this._readableState.buffer = [];
        this._readableState.ended = true;
        if (err) this.emit('error', err);
        this.emit('close');
      }

      pipe(dest) {
        this.on('data', (chunk) => dest.push(chunk));
        this.on('end', () => dest.push(null));
        this.on('error', (err) => dest.destroy(err));
        return dest;
      }

      on(event, listener) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(listener);
        if (event === 'readable' && this._readableState.length > 0) listener();
        return this;
      }

      emit(event, ...args) {
        const listeners = this._events[event];
        if (listeners) {
          const listenersArray = [...listeners];
          for (const listener of listenersArray) {
            try {
              listener.apply(this, args);
            } catch (error) {
              console.error('Stream emit error:', error);
            }
          }
          return listenersArray.length > 0;
        }
        return false;
      }
    },
  };
}

// Prevent readable-stream errors
const noop = () => {};
window.setImmediate = window.setImmediate || ((fn, ...args) => setTimeout(() => fn(...args), 0));
window.clearImmediate = window.clearImmediate || clearTimeout;

export default {};