// jest.setup.ts (e.g., at the root of your project)

// This file will be run by Jest *before* any of your test files are executed,
// but *after* the test environment (like JSDOM) has been set up.

if (typeof global.Request === 'undefined') {
  console.log('[Jest Setup] Polyfilling Request...');
  // @ts-ignore
  global.Request = class Request {
    url: string;
    headers: Headers; // Assumes Headers is also polyfilled by this file
    method: string;
    _body: any;

    constructor(input: string | URL, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.toString();
      this.headers = new Headers(init?.headers); // Use the polyfilled Headers
      this.method = init?.method || 'GET';
      this._body = init?.body;
    }
    async json() { 
        if (this._body === undefined || this._body === null) return {};
        if (typeof this._body === 'string') {
            try { return JSON.parse(this._body); } catch (e) { return {}; }
        }
        return this._body; 
    }
    async text() { 
        if (this._body === undefined || this._body === null) return '';
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
    }
  };
}

if (typeof global.Response === 'undefined') {
  console.log('[Jest Setup] Polyfilling Response...');
    // @ts-ignore
  global.Response = class Response {
    // Basic mock, expand if needed
    readonly headers: Headers;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: ResponseType;
    readonly url: string;
    // @ts-ignore
    clone(): Response { throw new Error("Method not implemented."); }
    // @ts-ignore
    arrayBuffer(): Promise<ArrayBuffer> { throw new Error("Method not implemented."); }
    // @ts-ignore
    blob(): Promise<Blob> { throw new Error("Method not implemented."); }
    // @ts-ignore
    formData(): Promise<FormData> { throw new Error("Method not implemented."); }
    // @ts-ignore
    json(): Promise<any> { throw new Error("Method not implemented."); }
    // @ts-ignore
    text(): Promise<string> { throw new Error("Method not implemented."); }


    constructor(body?: any, init?: ResponseInit) { 
        this.headers = new Headers(init?.headers);
        this.status = init?.status || 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = init?.statusText || 'OK';
        this.url = ''; // Simplified
        this.redirected = false; // Simplified
        this.type = 'default'; // Simplified
        // Note: Body handling not implemented for simplicity
    }
    static json(data: any, init?: ResponseInit) {
        const body = JSON.stringify(data);
        const headers = new Headers(init?.headers);
        if (!headers.has('content-type')) {
            headers.set('content-type', 'application/json');
        }
        return new (global.Response as any)(body, {...init, headers });
    }
  };
}

if (typeof global.Headers === 'undefined') {
  console.log('[Jest Setup] Polyfilling Headers...');
  // @ts-ignore
  global.Headers = class Headers {
    private map = new Map<string, string>();
    constructor(init?: HeadersInit) { // HeadersInit can be Headers, string[][], or Record<string, string>
      if (init) {
        if (init instanceof (global.Headers as any)) { // Check if init is already a Headers instance
            init.forEach((value: string, key: string) => { // <--- PROBLEM LIKELY HERE if init.forEach is not what we expect
                this.append(key, value);
            });
        } else if (Array.isArray(init)) {
          // init is string[][] e.g. [['Content-Type', 'application/json']]
          init.forEach(([key, value]) => this.append(key, value));
        } else if (typeof init === 'object' && init !== null) {
          // init is Record<string, string> e.g. { 'Content-Type': 'application/json' }
          Object.entries(init).forEach(([key, value]) => this.append(key, value as string));
        }
      }
    }
    append(name: string, value: string): void { this.map.set(name.toLowerCase(), value); }
    delete(name: string): void { this.map.delete(name.toLowerCase()); }
    get(name: string): string | null { return this.map.get(name.toLowerCase()) || null; }
    has(name: string): boolean { return this.map.has(name.toLowerCase()); }
    set(name: string, value: string): void { this.map.set(name.toLowerCase(), value); }
    
    // This is the forEach method of OUR Headers class
    forEach(callback: (value: string, key: string, parent: this) => void, thisArg?: any): void {
        for (const [key, value] of this.map.entries()) {
            callback.call(thisArg, value, key, this);
        }
    }

    // Implement iterator for spread syntax and for...of loops (makes it act like a real Headers object)
    *[Symbol.iterator](): IterableIterator<[string, string]> {
        for (const entry of this.map) {
            yield entry;
        }
    }
    
    entries(): IterableIterator<[string, string]> { return this.map.entries(); }
    keys(): IterableIterator<string> { return this.map.keys(); }
    values(): IterableIterator<string> { return this.map.values(); }
  };
}
