// Polyfill & patch to ensure window.fetch has both getter and setter on all prototype levels
// Prevents "Cannot set property fetch of #<Window> which has only a getter"
(function fixFetchGetter() {
  try {
    const win: any = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : undefined);
    if (!win) return;

    let curFetch = typeof win.fetch === 'function' ? win.fetch.bind(win) : win.fetch;

    const targets: any[] = [win];
    if (typeof Window !== 'undefined' && Window.prototype) {
      targets.push(Window.prototype);
    }

    let p = win;
    while (p) {
      if (targets.indexOf(p) === -1) {
        targets.push(p);
      }
      p = Object.getPrototypeOf(p);
    }

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      try {
        const desc = Object.getOwnPropertyDescriptor(target, 'fetch');
        if (desc && (desc.set === undefined || desc.writable === false)) {
          Object.defineProperty(target, 'fetch', {
            get: function () {
              return curFetch;
            },
            set: function (val: any) {
              curFetch = val;
            },
            configurable: true,
            enumerable: true,
          });
        }
      } catch {
        // Ignore non-configurable descriptors if any
      }
    }
  } catch {
    // Fail-safe
  }
})();

export {};
